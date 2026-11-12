package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.emsi.academic.domain.entity.Campus;
import ma.emsi.academic.domain.entity.Filiere;
import ma.emsi.academic.domain.entity.Groupe;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.groupe.CreateGroupeRequest;
import ma.emsi.academic.dto.groupe.GroupeDto;
import ma.emsi.academic.exception.BusinessRuleException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.CampusRepository;
import ma.emsi.academic.repository.FiliereRepository;
import ma.emsi.academic.repository.GroupeRepository;
import ma.emsi.academic.service.GroupeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupeServiceImpl implements GroupeService {
    private final ma.emsi.academic.repository.TeachingRequirementRepository requirements;
    private final ma.emsi.academic.repository.SeanceRepository seanceRepository;
    private final ma.emsi.academic.repository.EtudiantRepository etudiantRepository;

    private final GroupeRepository groupeRepository;
    private final FiliereRepository filiereRepository;
    private final CampusRepository campusRepository;

    @Override
    public PageResponse<GroupeDto> getAllGroupes(Pageable pageable) {
        Page<Groupe> page = groupeRepository.findAll(pageable);
        List<GroupeDto> dtoList = page.getContent().stream().map(this::mapToDto).toList();
        return PageResponse.from(page, dtoList);
    }

    @Override
    public PageResponse<GroupeDto> getGroupesByCampus(Long campusId, Pageable pageable) {
        if (!campusRepository.existsById(campusId)) {
            throw new ResourceNotFoundException("Campus introuvable avec l'identifiant : " + campusId);
        }
        Page<Groupe> page = groupeRepository.findByCampusFixeId(campusId, pageable);
        List<GroupeDto> dtoList = page.getContent().stream().map(this::mapToDto).toList();
        return PageResponse.from(page, dtoList);
    }

    @Override
    public PageResponse<GroupeDto> getGroupesByFiliere(Long filiereId, Pageable pageable) {
        if (!filiereRepository.existsById(filiereId)) {
            throw new ResourceNotFoundException("Filière introuvable avec l'identifiant : " + filiereId);
        }
        Page<Groupe> page = groupeRepository.findByFiliereId(filiereId, pageable);
        List<GroupeDto> dtoList = page.getContent().stream().map(this::mapToDto).toList();
        return PageResponse.from(page, dtoList);
    }

    @Override
    public GroupeDto getGroupeById(Long id) {
        Groupe groupe = groupeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable avec l'identifiant : " + id));
        return mapToDto(groupe);
    }

    @Override
    @Transactional
    public GroupeDto createGroupe(CreateGroupeRequest request) {
        if (groupeRepository.findAll().stream().anyMatch(g -> g.getCodeGroupe().equalsIgnoreCase(request.getCodeGroupe().trim()))) {
            throw new BusinessRuleException("Un groupe avec le code '" + request.getCodeGroupe() + "' existe déjà.");
        }

        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable : " + request.getFiliereId()));

        // RÈGLE ABSOLUE DU CAMPUS FIXE (1 groupe = 1 campus)
        Campus campus = campusRepository.findById(request.getCampusFixeId())
                .orElseThrow(() -> new ResourceNotFoundException("Campus assigné introuvable : " + request.getCampusFixeId()));

        Groupe groupe = Groupe.builder()
                .filiere(filiere)
                .campusFixe(campus)
                .codeGroupe(request.getCodeGroupe().trim())
                .anneeEtude(request.getAnneeEtude())
                .optionSpecialite(request.getOptionSpecialite())
                .effectif(request.getEffectif())
                .delegueNom(request.getDelegueNom())
                .laboratoiresRequis(request.getLaboratoiresRequis() != null ? request.getLaboratoiresRequis() : "LI_PC")
                .build();

        return mapToDto(groupeRepository.save(groupe));
    }

    @Override
    @Transactional
    public GroupeDto updateGroupe(Long id, CreateGroupeRequest request) {
        Groupe groupe = groupeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));
        if (!groupe.getFiliere().getId().equals(request.getFiliereId()) && requirements.existsByGroupeId(id)) throw new BusinessRuleException("Ce groupe a des besoins pédagogiques. Réaffectez ou retirez ces besoins avant de changer sa filière.");
        if (groupeRepository.findAll().stream().anyMatch(g -> !g.getId().equals(id) && g.getCodeGroupe().equalsIgnoreCase(request.getCodeGroupe().trim()))) throw new BusinessRuleException("Ce code de groupe existe déjà.");
        if (groupe.getSeances().stream().anyMatch(s -> !s.getSalle().getCampus().getId().equals(request.getCampusFixeId()) || s.getSalle().getCapacite() < request.getEffectif() || !s.getElementModule().getModule().getFiliere().getId().equals(request.getFiliereId()))) throw new BusinessRuleException("Cette modification rendrait les séances existantes incompatibles.");
        groupe.setFiliere(filiereRepository.findById(request.getFiliereId()).orElseThrow(() -> new ResourceNotFoundException("Filière introuvable.")));
        groupe.setCampusFixe(campusRepository.findById(request.getCampusFixeId()).orElseThrow(() -> new ResourceNotFoundException("Campus introuvable.")));
        groupe.setCodeGroupe(request.getCodeGroupe().trim()); groupe.setAnneeEtude(request.getAnneeEtude());
        groupe.setEffectif(request.getEffectif()); groupe.setOptionSpecialite(request.getOptionSpecialite());
        groupe.setDelegueNom(request.getDelegueNom()); groupe.setLaboratoiresRequis(request.getLaboratoiresRequis());
        return mapToDto(groupeRepository.save(groupe));
    }

    @Override
    @Transactional
    public GroupeDto updateEffectif(Long id, int newEffectif) {
        if (newEffectif <= 0) {
            throw new BusinessRuleException("L'effectif doit être strictement supérieur à 0.");
        }

        Groupe groupe = groupeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable avec l'identifiant : " + id));

        groupe.setEffectif(newEffectif);
        return mapToDto(groupeRepository.save(groupe));
    }

    @Override
    @Transactional
    public void deleteGroupe(Long id) {
        Groupe groupe = groupeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));
        if (etudiantRepository.existsByGroupeId(id) || seanceRepository.existsByGroupeId(id)) throw new BusinessRuleException("Ce groupe contient des étudiants ou des séances. Réaffectez-les avant de le supprimer.");
        if (requirements.existsByGroupeId(id)) throw new BusinessRuleException("Ce groupe est utilisé par des besoins pédagogiques. Retirez ces besoins dans la planification avant de supprimer le groupe.");
        groupeRepository.delete(groupe);
    }

    private GroupeDto mapToDto(Groupe groupe) {
        return GroupeDto.builder()
                .id(groupe.getId())
                .filiereId(groupe.getFiliere() != null ? groupe.getFiliere().getId() : null)
                .filiereCode(groupe.getFiliere() != null ? groupe.getFiliere().getCode() : null)
                .filiereLibelle(groupe.getFiliere() != null ? groupe.getFiliere().getLibelle() : null)
                .campusFixeId(groupe.getCampusFixe() != null ? groupe.getCampusFixe().getId() : null)
                .campusFixeNom(groupe.getCampusFixe() != null ? groupe.getCampusFixe().getNom() : null)
                .codeGroupe(groupe.getCodeGroupe())
                .anneeEtude(groupe.getAnneeEtude())
                .optionSpecialite(groupe.getOptionSpecialite())
                .effectif(groupe.getEffectif())
                .delegueNom(groupe.getDelegueNom())
                .laboratoiresRequis(groupe.getLaboratoiresRequis())
                .build();
    }
}
