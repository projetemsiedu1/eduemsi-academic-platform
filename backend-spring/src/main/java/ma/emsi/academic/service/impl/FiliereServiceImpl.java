package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Filiere;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.filiere.FiliereDto;
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
        Filiere f = filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filière non trouvée avec l'id : " + id));
        return mapToDto(f);
    }

    private FiliereDto mapToDto(Filiere f) {
        return FiliereDto.builder()
                .id(f.getId())
                .code(f.getCode())
                .libelle(f.getLibelle())
                .nombreGroupes(f.getGroupes() != null ? f.getGroupes().size() : 0)
                .nombreModules(f.getModules() != null ? f.getModules().size() : 0)
                .build();
    }
}
