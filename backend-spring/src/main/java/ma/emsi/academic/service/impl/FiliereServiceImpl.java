package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Filiere;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.filiere.CreateFiliereRequest;
import ma.emsi.academic.dto.filiere.FiliereDto;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.FiliereRepository;
import ma.emsi.academic.service.FiliereService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FiliereServiceImpl implements FiliereService {

    private final FiliereRepository filiereRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FiliereDto> getAllFilieres(Pageable pageable) {
        Page<Filiere> page = filiereRepository.findAll(pageable);
        List<FiliereDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<FiliereDto>builder()
                .content(dtos)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FiliereDto> getAllFilieresList() {
        return filiereRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FiliereDto getFiliereById(Long id) {
        Filiere filiere = filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filiere introuvable avec l'identifiant : " + id));
        return mapToDto(filiere);
    }

    @Override
    @Transactional
    public FiliereDto createFiliere(CreateFiliereRequest request) {
        request.setCode(request.getCode().trim().toUpperCase(java.util.Locale.ROOT));
        if (filiereRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Une filière avec le code '" + request.getCode() + "' existe déjà.");
        }
        Filiere filiere = Filiere.builder()
                .code(request.getCode().trim().toUpperCase())
                .libelle(request.getLibelle().trim())
                .build();
        Filiere saved = filiereRepository.save(filiere);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FiliereDto updateFiliere(Long id, CreateFiliereRequest request) {
        request.setCode(request.getCode().trim().toUpperCase(java.util.Locale.ROOT));
        Filiere filiere = filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filiere introuvable avec l'identifiant : " + id));

        filiereRepository.findByCode(request.getCode()).ifPresent(f -> {
            if (!f.getId().equals(id)) {
                throw new BadRequestException("Une autre filière avec le code '" + request.getCode() + "' existe déjà.");
            }
        });

        filiere.setCode(request.getCode().trim().toUpperCase());
        filiere.setLibelle(request.getLibelle().trim());
        Filiere updated = filiereRepository.save(filiere);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteFiliere(Long id) {
        Filiere filiere = filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filiere introuvable avec l'identifiant : " + id));
        if (filiere.getGroupes() != null && !filiere.getGroupes().isEmpty()) {
            throw new BadRequestException("Impossible de supprimer cette filière car elle contient " + filiere.getGroupes().size() + " groupe(s) actif(s).");
        }
        if (filiere.getModules() != null && !filiere.getModules().isEmpty()) {
            throw new BadRequestException("Cette filière contient des modules. Leur contenu est conservé : réaffectez-les avant de supprimer la filière.");
        }
        filiereRepository.delete(filiere);
    }

    private FiliereDto mapToDto(Filiere filiere) {
        return FiliereDto.builder()
                .id(filiere.getId())
                .code(filiere.getCode())
                .libelle(filiere.getLibelle())
                .nombreGroupes(filiere.getGroupes() != null ? filiere.getGroupes().size() : 0)
                .nombreModules(filiere.getModules() != null ? filiere.getModules().size() : 0)
                .build();
    }
}
