package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Etudiant;
import ma.emsi.academic.domain.entity.Groupe;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.etudiant.CreateEtudiantRequest;
import ma.emsi.academic.dto.etudiant.EtudiantDto;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.EtudiantRepository;
import ma.emsi.academic.repository.GroupeRepository;
import ma.emsi.academic.service.EtudiantService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ma.emsi.academic.domain.entity.Seance;
import ma.emsi.academic.domain.entity.Utilisateur;
import ma.emsi.academic.dto.seance.SeanceDetailsDto;
import ma.emsi.academic.repository.SeanceRepository;
import ma.emsi.academic.repository.UtilisateurRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EtudiantServiceImpl implements EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final GroupeRepository groupeRepository;
    private final SeanceRepository seanceRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public EtudiantDto getMonProfil(String emailOuUsername) {
        String targetEmail = emailOuUsername;
        if (emailOuUsername != null && !emailOuUsername.contains("@")) {
            Optional<Utilisateur> userOpt = utilisateurRepository.findByUsername(emailOuUsername);
            if (userOpt.isPresent()) {
                targetEmail = userOpt.get().getEmail();
            }
        }

        Etudiant etudiant = etudiantRepository.findByEmail(targetEmail)
                .orElseGet(() -> etudiantRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Profil étudiant introuvable pour : " + emailOuUsername)));

        return mapToDto(etudiant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeanceDetailsDto> getMonEmploiDuTemps(String emailOuUsername) {
        EtudiantDto profil = getMonProfil(emailOuUsername);
        if (profil == null || profil.getGroupeId() == null) {
            return List.of();
        }

        List<Seance> seances = seanceRepository.findByGroupeIdOrderByJourSemaineAscNumeroCreneauAsc(profil.getGroupeId());
        return seances.stream().map(s -> SeanceDetailsDto.builder()
                .id(s.getId())
                .groupeId(s.getGroupe() != null ? s.getGroupe().getId() : null)
                .groupeNom(s.getGroupe() != null ? s.getGroupe().getCodeGroupe() : "")
                .salleId(s.getSalle() != null ? s.getSalle().getId() : null)
                .salleCode(s.getSalle() != null ? s.getSalle().getCodeSalle() : "")
                .campusNom(s.getSalle() != null && s.getSalle().getCampus() != null ? s.getSalle().getCampus().getNom() : "")
                .enseignantId(s.getEnseignant() != null ? s.getEnseignant().getId() : null)
                .enseignantNom(s.getEnseignant() != null ? s.getEnseignant().getNom() + " " + s.getEnseignant().getPrenom() : "")
                .elementModuleId(s.getElementModule() != null ? s.getElementModule().getId() : null)
                .elementModuleCode(s.getElementModule() != null ? s.getElementModule().getCodeElement() : "")
                .elementModuleIntitule(s.getElementModule() != null ? s.getElementModule().getIntitule() : "")
                .moduleNom(s.getElementModule() != null && s.getElementModule().getModule() != null ? s.getElementModule().getModule().getIntitule() : "")
                .jourSemaine(s.getJourSemaine() != null ? s.getJourSemaine().name() : "")
                .numeroCreneau(s.getNumeroCreneau() != null ? s.getNumeroCreneau().name() : "")
                .horaireDebut(s.getNumeroCreneau() != null ? s.getNumeroCreneau().getHeureDebut() : "08:30")
                .horaireFin(s.getNumeroCreneau() != null ? s.getNumeroCreneau().getHeureFin() : "10:00")
                .dureeMinutes(90)
                .typeSalle(s.getSalle() != null && s.getSalle().getTypeSalle() != null ? s.getSalle().getTypeSalle().name() : "STANDARD")
                .build()
        ).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EtudiantDto> getAllEtudiants(Pageable pageable) {
        Page<Etudiant> page = etudiantRepository.findAll(pageable);
        List<EtudiantDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<EtudiantDto>builder()
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
    public PageResponse<EtudiantDto> getEtudiantsByGroupe(Long groupeId, Pageable pageable) {
        Page<Etudiant> page = etudiantRepository.findByGroupeId(groupeId, pageable);
        List<EtudiantDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<EtudiantDto>builder()
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
    public EtudiantDto getEtudiantById(Long id) {
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable avec l'identifiant : " + id));
        return mapToDto(etudiant);
    }

    @Override
    @Transactional
    public EtudiantDto createEtudiant(CreateEtudiantRequest request) {
        request.setMatricule(request.getMatricule().trim().toUpperCase(java.util.Locale.ROOT));
        request.setEmail(request.getEmail().trim().toLowerCase(java.util.Locale.ROOT));
        if (etudiantRepository.existsByMatricule(request.getMatricule())) {
            throw new BadRequestException("Un étudiant avec le matricule '" + request.getMatricule() + "' existe déjà.");
        }
        if (etudiantRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Un étudiant avec l'adresse email '" + request.getEmail() + "' existe déjà.");
        }

        Groupe groupe = groupeRepository.findById(request.getGroupeId())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable avec l'identifiant : " + request.getGroupeId()));

        BigDecimal totalHeures = request.getTotalHeuresModuleSemestre() != null
                ? request.getTotalHeuresModuleSemestre()
                : BigDecimal.valueOf(90.00);

        Etudiant etudiant = Etudiant.builder()
                .matricule(request.getMatricule().trim().toUpperCase())
                .nom(request.getNom().trim())
                .prenom(request.getPrenom().trim())
                .email(request.getEmail().trim().toLowerCase())
                .telephone(request.getTelephone())
                .groupe(groupe)
                .totalHeuresModuleSemestre(totalHeures)
                .cumulHeuresAbsence(BigDecimal.ZERO)
                .estRadieExamen(false)
                .build();

        Etudiant saved = etudiantRepository.save(etudiant);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public EtudiantDto updateEtudiant(Long id, CreateEtudiantRequest request) {
        request.setMatricule(request.getMatricule().trim().toUpperCase(java.util.Locale.ROOT));
        request.setEmail(request.getEmail().trim().toLowerCase(java.util.Locale.ROOT));
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable avec l'identifiant : " + id));

        etudiantRepository.findByMatricule(request.getMatricule()).ifPresent(e -> {
            if (!e.getId().equals(id)) {
                throw new BadRequestException("Le matricule '" + request.getMatricule() + "' est déjà attribué.");
            }
        });

        etudiantRepository.findByEmail(request.getEmail()).ifPresent(e -> {
            if (!e.getId().equals(id)) {
                throw new BadRequestException("L'email '" + request.getEmail() + "' est déjà utilisé.");
            }
        });

        Groupe groupe = groupeRepository.findById(request.getGroupeId())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable avec l'identifiant : " + request.getGroupeId()));

        etudiant.setMatricule(request.getMatricule().trim().toUpperCase());
        etudiant.setNom(request.getNom().trim());
        etudiant.setPrenom(request.getPrenom().trim());
        etudiant.setEmail(request.getEmail().trim().toLowerCase());
        etudiant.setTelephone(request.getTelephone());
        etudiant.setGroupe(groupe);
        if (request.getTotalHeuresModuleSemestre() != null) {
            etudiant.setTotalHeuresModuleSemestre(request.getTotalHeuresModuleSemestre());
        }

        // Recalcul du statut de radiation
        if (etudiant.getTotalHeuresModuleSemestre().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal seuil = etudiant.getTotalHeuresModuleSemestre().multiply(BigDecimal.valueOf(0.20));
            etudiant.setEstRadieExamen(etudiant.getCumulHeuresAbsence().compareTo(seuil) >= 0);
        }

        Etudiant updated = etudiantRepository.save(etudiant);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteEtudiant(Long id) {
        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable avec l'identifiant : " + id));
        etudiantRepository.delete(etudiant);
    }

    private EtudiantDto mapToDto(Etudiant etudiant) {
        double taux = 0.0;
        if (etudiant.getTotalHeuresModuleSemestre() != null && etudiant.getTotalHeuresModuleSemestre().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = etudiant.getCumulHeuresAbsence()
                    .divide(etudiant.getTotalHeuresModuleSemestre(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            taux = ratio.doubleValue();
        }

        String nomFiliere = (etudiant.getGroupe() != null && etudiant.getGroupe().getFiliere() != null)
                ? etudiant.getGroupe().getFiliere().getLibelle()
                : null;

        String nomCampus = (etudiant.getGroupe() != null && etudiant.getGroupe().getCampusFixe() != null)
                ? etudiant.getGroupe().getCampusFixe().getNom()
                : null;

        return EtudiantDto.builder()
                .id(etudiant.getId())
                .matricule(etudiant.getMatricule())
                .nom(etudiant.getNom())
                .prenom(etudiant.getPrenom())
                .email(etudiant.getEmail())
                .telephone(etudiant.getTelephone())
                .groupeId(etudiant.getGroupe() != null ? etudiant.getGroupe().getId() : null)
                .codeGroupe(etudiant.getGroupe() != null ? etudiant.getGroupe().getCodeGroupe() : null)
                .nomFiliere(nomFiliere)
                .nomCampus(nomCampus)
                .totalHeuresModuleSemestre(etudiant.getTotalHeuresModuleSemestre())
                .cumulHeuresAbsence(etudiant.getCumulHeuresAbsence())
                .tauxAbsence(taux)
                .estRadieExamen(etudiant.getEstRadieExamen())
                .build();
    }
}
