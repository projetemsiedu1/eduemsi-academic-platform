package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Enseignant;
import ma.emsi.academic.domain.enums.TypeContrat;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.enseignant.EnseignantDto;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.EnseignantRepository;
import ma.emsi.academic.service.EnseignantService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnseignantServiceImpl implements EnseignantService {

    private final EnseignantRepository enseignantRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EnseignantDto> getAllEnseignants(TypeContrat typeContrat, Pageable pageable) {
        Page<Enseignant> page = (typeContrat != null)
                ? enseignantRepository.findByTypeContrat(typeContrat, pageable)
                : enseignantRepository.findAll(pageable);

        List<EnseignantDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<EnseignantDto>builder()
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
    public List<EnseignantDto> getEnseignantsByContrat(TypeContrat typeContrat) {
        return enseignantRepository.findByTypeContrat(typeContrat).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EnseignantDto getEnseignantById(Long id) {
        Enseignant e = enseignantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant non trouvé avec l'id : " + id));
        return mapToDto(e);
    }

    private EnseignantDto mapToDto(Enseignant e) {
        int heures = e.getSeances() != null ? e.getSeances().size() * 2 : 0;
        return EnseignantDto.builder()
                .id(e.getId())
                .matricule(e.getMatricule())
                .nom(e.getNom())
                .prenom(e.getPrenom())
                .email(e.getEmail())
                .telephone(e.getTelephone())
                .specialite(e.getSpecialite())
                .typeContrat(e.getTypeContrat())
                .heuresContractuellesSemaine(e.getHeuresContractuellesSemaine())
                .heuresPlanifiees(heures)
                .build();
    }
}
