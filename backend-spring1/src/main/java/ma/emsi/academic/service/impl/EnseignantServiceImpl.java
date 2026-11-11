package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Enseignant;
import ma.emsi.academic.domain.enums.TypeContrat;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.enseignant.CreateEnseignantRequest;
import ma.emsi.academic.dto.enseignant.EnseignantDto;
import ma.emsi.academic.exception.BadRequestException;
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
        Enseignant enseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable avec l'identifiant : " + id));
        return mapToDto(enseignant);
    }

    @Override
    @Transactional
    public EnseignantDto createEnseignant(CreateEnseignantRequest request) {
        if (enseignantRepository.existsByMatricule(request.getMatricule())) {
            throw new BadRequestException("Un enseignant avec le matricule '" + request.getMatricule() + "' existe déjà.");
        }
        if (enseignantRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Un enseignant avec l'email '" + request.getEmail() + "' existe déjà.");
        }

        int heures = request.getHeuresContractuellesSemaine() != null ? request.getHeuresContractuellesSemaine() :
                (request.getTypeContrat() == TypeContrat.VACATAIRE ? 12 : 18);

        Enseignant enseignant = Enseignant.builder()
                .matricule(request.getMatricule().trim().toUpperCase())
                .nom(request.getNom().trim())
                .prenom(request.getPrenom().trim())
                .email(request.getEmail().trim().toLowerCase())
                .telephone(request.getTelephone())
                .specialite(request.getSpecialite())
                .typeContrat(request.getTypeContrat())
                .heuresContractuellesSemaine(heures)
                .disponibilitesFixesJson(request.getDisponibilitesFixesJson())
                .estActif(true)
                .build();

        Enseignant saved = enseignantRepository.save(enseignant);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public EnseignantDto updateEnseignant(Long id, CreateEnseignantRequest request) {
        Enseignant enseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable avec l'identifiant : " + id));

        enseignantRepository.findByMatricule(request.getMatricule()).ifPresent(e -> {
            if (!e.getId().equals(id)) {
                throw new BadRequestException("Le matricule '" + request.getMatricule() + "' est déjà attribué.");
            }
        });

        enseignantRepository.findByEmail(request.getEmail()).ifPresent(e -> {
            if (!e.getId().equals(id)) {
                throw new BadRequestException("L'adresse email '" + request.getEmail() + "' est déjà utilisée.");
            }
        });

        enseignant.setMatricule(request.getMatricule().trim().toUpperCase());
        enseignant.setNom(request.getNom().trim());
        enseignant.setPrenom(request.getPrenom().trim());
        enseignant.setEmail(request.getEmail().trim().toLowerCase());
        enseignant.setTelephone(request.getTelephone());
        enseignant.setSpecialite(request.getSpecialite());
        enseignant.setTypeContrat(request.getTypeContrat());
        if (request.getHeuresContractuellesSemaine() != null) {
            enseignant.setHeuresContractuellesSemaine(request.getHeuresContractuellesSemaine());
        }
        if (request.getDisponibilitesFixesJson() != null) {
            enseignant.setDisponibilitesFixesJson(request.getDisponibilitesFixesJson());
        }

        Enseignant updated = enseignantRepository.save(enseignant);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteEnseignant(Long id) {
        Enseignant enseignant = enseignantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable avec l'identifiant : " + id));
        if (enseignant.getSeances() != null && !enseignant.getSeances().isEmpty()) {
            throw new BadRequestException("Impossible de supprimer cet enseignant car il a des séances de cours planifiées.");
        }
        enseignantRepository.delete(enseignant);
    }

    private EnseignantDto mapToDto(Enseignant enseignant) {
        int heuresPlanifiees = (enseignant.getSeances() != null)
                ? (int) Math.round(enseignant.getSeances().size() * 1.5)
                : 0;

        return EnseignantDto.builder()
                .id(enseignant.getId())
                .matricule(enseignant.getMatricule())
                .nom(enseignant.getNom())
                .prenom(enseignant.getPrenom())
                .email(enseignant.getEmail())
                .telephone(enseignant.getTelephone())
                .specialite(enseignant.getSpecialite())
                .typeContrat(enseignant.getTypeContrat())
                .heuresContractuellesSemaine(enseignant.getHeuresContractuellesSemaine())
                .heuresPlanifiees(heuresPlanifiees)
                .build();
    }
}
