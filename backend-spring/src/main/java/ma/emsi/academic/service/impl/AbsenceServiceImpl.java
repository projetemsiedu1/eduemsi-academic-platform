package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Absence;
import ma.emsi.academic.domain.entity.Etudiant;
import ma.emsi.academic.domain.entity.Seance;
import ma.emsi.academic.domain.enums.StatutAbsence;
import ma.emsi.academic.dto.absence.AbsenceDto;
import ma.emsi.academic.dto.absence.EtudiantAlerteAbsenceDto;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.AbsenceRepository;
import ma.emsi.academic.repository.EtudiantRepository;
import ma.emsi.academic.repository.SeanceRepository;
import ma.emsi.academic.service.AbsenceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ma.emsi.academic.domain.entity.Utilisateur;
import ma.emsi.academic.dto.absence.BilanAbsenceEtudiantDto;
import ma.emsi.academic.dto.absence.BilanAbsenceEtudiantDto.ModuleAbsenceSyntheseDto;
import ma.emsi.academic.repository.UtilisateurRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbsenceServiceImpl implements AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final EtudiantRepository etudiantRepository;
    private final SeanceRepository seanceRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public BilanAbsenceEtudiantDto getBilanAbsencesEtudiant(String emailOuUsername) {
        String targetEmail = emailOuUsername;
        if (emailOuUsername != null && !emailOuUsername.contains("@")) {
            Optional<Utilisateur> userOpt = utilisateurRepository.findByUsername(emailOuUsername);
            if (userOpt.isPresent()) {
                targetEmail = userOpt.get().getEmail();
            }
        }

        Etudiant etudiant = etudiantRepository.findByEmail(targetEmail)
                .orElseGet(() -> etudiantRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable pour : " + emailOuUsername)));

        List<Absence> absences = absenceRepository.findByEtudiantId(etudiant.getId());
        List<AbsenceDto> absenceDtos = absences.stream().map(this::mapToDto).toList();

        int justifiees = (int) absences.stream().filter(a -> a.getStatut() == StatutAbsence.ABSENT_JUSTIFIE || Boolean.TRUE.equals(a.getValideParScolarite())).count();
        int nonJustifiees = absences.size() - justifiees;

        // Group by module for synthesis
        Map<String, List<Absence>> parModule = absences.stream()
                .filter(a -> a.getSeance() != null && a.getSeance().getElementModule() != null)
                .collect(Collectors.groupingBy(a -> a.getSeance().getElementModule().getIntitule()));

        List<ModuleAbsenceSyntheseDto> syntheseModules = new ArrayList<>();
        parModule.forEach((moduleNom, absList) -> {
            double totalH = 40.0;
            double heuresAbs = absList.stream()
                    .map(a -> a.getHeuresAbsence() != null ? a.getHeuresAbsence().doubleValue() : 1.5)
                    .reduce(0.0, Double::sum);
            double pct = Math.round((heuresAbs / totalH) * 1000.0) / 10.0;
            int justif = (int) absList.stream().filter(a -> a.getStatut() == StatutAbsence.ABSENT_JUSTIFIE).count();

            syntheseModules.add(ModuleAbsenceSyntheseDto.builder()
                    .moduleCode("MOD-" + Math.abs(moduleNom.hashCode() % 1000))
                    .moduleNom(moduleNom)
                    .totalHeures(totalH)
                    .heuresAbsence(heuresAbs)
                    .pourcentage(pct)
                    .seuilDepasse(pct >= 20.0)
                    .absencesJustifiees(justif)
                    .absencesNonJustifiees(absList.size() - justif)
                    .build());
        });

        double totalHeuresSemestre = etudiant.getTotalHeuresModuleSemestre() != null ? etudiant.getTotalHeuresModuleSemestre().doubleValue() : 90.0;
        double cumulAbsence = etudiant.getCumulHeuresAbsence() != null ? etudiant.getCumulHeuresAbsence().doubleValue() : 0.0;
        double pourcentageGlobal = totalHeuresSemestre > 0 ? Math.round((cumulAbsence / totalHeuresSemestre) * 1000.0) / 10.0 : 0.0;

        String groupeNom = etudiant.getGroupe() != null ? etudiant.getGroupe().getCodeGroupe() : "N/A";
        String filiereNom = etudiant.getGroupe() != null && etudiant.getGroupe().getFiliere() != null ? etudiant.getGroupe().getFiliere().getLibelle() : "N/A";
        String campusNom = etudiant.getGroupe() != null && etudiant.getGroupe().getCampusFixe() != null ? etudiant.getGroupe().getCampusFixe().getNom() : "N/A";

        return BilanAbsenceEtudiantDto.builder()
                .etudiantId(etudiant.getId())
                .matricule(etudiant.getMatricule())
                .nomComplet(etudiant.getNom() + " " + etudiant.getPrenom())
                .groupeNom(groupeNom)
                .filiereNom(filiereNom)
                .campusNom(campusNom)
                .totalHeuresModuleSemestre(BigDecimal.valueOf(totalHeuresSemestre))
                .cumulHeuresAbsence(BigDecimal.valueOf(cumulAbsence))
                .pourcentageAbsence(pourcentageGlobal)
                .estRadieExamen(Boolean.TRUE.equals(etudiant.getEstRadieExamen()))
                .nombreSeancesAbsentes(absences.size())
                .nombreSeancesJustifiees(justifiees)
                .historiqueAbsences(absenceDtos)
                .syntheseModules(syntheseModules)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AbsenceDto> getAllAbsences(Pageable pageable) {
        Page<Absence> page = absenceRepository.findAll(pageable);
        List<AbsenceDto> dtos = page.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<AbsenceDto>builder()
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
    public List<AbsenceDto> getAbsencesByEtudiant(Long etudiantId) {
        return absenceRepository.findByEtudiantId(etudiantId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EtudiantAlerteAbsenceDto> getEtudiantsSeuilCritique() {
        List<Absence> toutesLesAbsences = absenceRepository.findAll();

        Map<Etudiant, List<Absence>> parEtudiant = toutesLesAbsences.stream()
                .filter(a -> a.getStatut() == StatutAbsence.ABSENT_NON_JUSTIFIE)
                .collect(Collectors.groupingBy(Absence::getEtudiant));

        List<EtudiantAlerteAbsenceDto> alertes = new ArrayList<>();

        for (Map.Entry<Etudiant, List<Absence>> entry : parEtudiant.entrySet()) {
            Etudiant etu = entry.getKey();
            List<Absence> liste = entry.getValue();

            BigDecimal totalHeures = liste.stream()
                    .map(Absence::getHeuresAbsence)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double totalHeuresSemestre = etu.getTotalHeuresModuleSemestre() != null && etu.getTotalHeuresModuleSemestre().signum() > 0 ? etu.getTotalHeuresModuleSemestre().doubleValue() : 90.0;
            double pct = Math.min(100.0, (totalHeures.doubleValue() / totalHeuresSemestre) * 100.0);

            boolean seuilDepasse = pct >= 20.0;

            String sanction = "Normal";
            if (seuilDepasse) {
                sanction = "Élimination Examen (Seuil de 20% atteint)";
            } else if (totalHeures.compareTo(BigDecimal.valueOf(12.0)) >= 0) {
                sanction = "Avertissement 2 (Proche seuil)";
            } else if (totalHeures.compareTo(BigDecimal.valueOf(6.0)) >= 0) {
                sanction = "Avertissement 1";
            }

            alertes.add(EtudiantAlerteAbsenceDto.builder()
                    .etudiantId(etu.getId())
                    .matricule(etu.getMatricule())
                    .nom(etu.getNom())
                    .prenom(etu.getPrenom())
                    .groupeNom(etu.getGroupe() != null ? etu.getGroupe().getCodeGroupe() : "N/A")
                    .totalHeuresAbsence(totalHeures)
                    .pourcentageAbsence(Math.round(pct * 10.0) / 10.0)
                    .seuilEliminatoireAtteint(seuilDepasse)
                    .sanctionPrevue(sanction)
                    .build());
        }

        return alertes;
    }

    @Override
    @Transactional
    public AbsenceDto enregistrerAbsence(Long etudiantId, Long seanceId, String motif) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable : " + etudiantId));
        Seance seance = seanceRepository.findById(seanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Séance introuvable : " + seanceId));

        Absence absence = Absence.builder()
                .etudiant(etudiant)
                .seance(seance)
                .dateSeance(LocalDate.now())
                .statut(StatutAbsence.ABSENT_NON_JUSTIFIE)
                .heuresAbsence(BigDecimal.valueOf(1.5 * seance.getSpanSeances()))
                .motifJustification(motif)
                .valideParScolarite(false)
                .build();

        Absence saved = absenceRepository.save(absence);
        recalculerCumul(etudiant);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public AbsenceDto justifierAbsence(Long absenceId, String motif, boolean justifiee) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Absence introuvable avec l'identifiant : " + absenceId));

        absence.setStatut(justifiee ? StatutAbsence.ABSENT_JUSTIFIE : StatutAbsence.ABSENT_NON_JUSTIFIE);
        absence.setMotifJustification(motif);
        absence.setDateJustification(LocalDate.now());
        absence.setValideParScolarite(justifiee);

        Absence saved = absenceRepository.save(absence);
        recalculerCumul(absence.getEtudiant());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteAbsence(Long absenceId) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Absence introuvable avec l'identifiant : " + absenceId));
        Etudiant etudiant = absence.getEtudiant();
        absenceRepository.delete(absence);
        absenceRepository.flush();
        recalculerCumul(etudiant);
    }

    private void recalculerCumul(Etudiant etudiant) {
        BigDecimal cumul = absenceRepository.findByEtudiantId(etudiant.getId()).stream()
                .filter(a -> a.getStatut() == StatutAbsence.ABSENT_NON_JUSTIFIE)
                .map(Absence::getHeuresAbsence).reduce(BigDecimal.ZERO, BigDecimal::add);
        etudiant.setCumulHeuresAbsence(cumul);
        BigDecimal base = etudiant.getTotalHeuresModuleSemestre();
        etudiant.setEstRadieExamen(base != null && base.signum() > 0 && cumul.compareTo(base.multiply(new BigDecimal("0.20"))) >= 0);
        etudiantRepository.save(etudiant);
    }

    private AbsenceDto mapToDto(Absence a) {
        return AbsenceDto.builder()
                .id(a.getId())
                .etudiantId(a.getEtudiant().getId())
                .etudiantNom(a.getEtudiant().getNom())
                .etudiantPrenom(a.getEtudiant().getPrenom())
                .etudiantMatricule(a.getEtudiant().getMatricule())
                .groupeNom(a.getEtudiant().getGroupe() != null ? a.getEtudiant().getGroupe().getCodeGroupe() : "N/A")
                .seanceId(a.getSeance() != null ? a.getSeance().getId() : null)
                .moduleNom(a.getSeance() != null && a.getSeance().getElementModule() != null ? a.getSeance().getElementModule().getIntitule() : null)
                .dateSeance(a.getDateSeance())
                .statut(a.getStatut())
                .heuresAbsence(a.getHeuresAbsence())
                .motifJustification(a.getMotifJustification())
                .valideParScolarite(a.getValideParScolarite())
                .build();
    }
}
