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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbsenceServiceImpl implements AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final EtudiantRepository etudiantRepository;
    private final SeanceRepository seanceRepository;

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
        List<Absence> absences = absenceRepository.findAll();
        Map<Etudiant, List<Absence>> parEtudiant = absences.stream()
                .collect(Collectors.groupingBy(Absence::getEtudiant));

        List<EtudiantAlerteAbsenceDto> alertes = new ArrayList<>();

        for (Map.Entry<Etudiant, List<Absence>> entry : parEtudiant.entrySet()) {
            Etudiant etu = entry.getKey();
            List<Absence> liste = entry.getValue();

            BigDecimal totalHeures = liste.stream()
                    .map(Absence::getHeuresAbsence)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Base de calcul standard semestre : ~90 heures de cours par module / semestre
            double totalHeuresSemestre = 90.0;
            double pct = Math.min(100.0, (totalHeures.doubleValue() / totalHeuresSemestre) * 100.0);

            // Règle d'exclusion académique EMSI : 20% ou 18 heures d'absence
            boolean seuilDepasse = totalHeures.compareTo(BigDecimal.valueOf(18.0)) >= 0 || pct >= 20.0;

            String sanction = "Normal";
            if (seuilDepasse) {
                sanction = "Élimination Examen (Seuil 20% / 18h dépassé)";
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
                .heuresAbsence(BigDecimal.valueOf(2.0))
                .motifJustification(motif)
                .valideParScolarite(false)
                .build();

        return mapToDto(absenceRepository.save(absence));
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
                .moduleNom(a.getSeance() != null && a.getSeance().getElementModule() != null
                        ? a.getSeance().getElementModule().getIntitule() : "Séance de cours")
                .dateSeance(a.getDateSeance())
                .statut(a.getStatut())
                .heuresAbsence(a.getHeuresAbsence())
                .motifJustification(a.getMotifJustification())
                .valideParScolarite(a.getValideParScolarite())
                .build();
    }
}
