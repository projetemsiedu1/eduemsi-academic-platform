package ma.emsi.academic.service;

import ma.emsi.academic.domain.entity.Absence;
import ma.emsi.academic.domain.entity.Etudiant;
import ma.emsi.academic.domain.entity.Groupe;
import ma.emsi.academic.domain.enums.StatutAbsence;
import ma.emsi.academic.dto.absence.EtudiantAlerteAbsenceDto;
import ma.emsi.academic.repository.AbsenceRepository;
import ma.emsi.academic.repository.EtudiantRepository;
import ma.emsi.academic.repository.SeanceRepository;
import ma.emsi.academic.service.impl.AbsenceServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AbsenceServiceTest {

    @Mock
    private AbsenceRepository absenceRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private SeanceRepository seanceRepository;

    @InjectMocks
    private AbsenceServiceImpl absenceService;

    @Test
    @DisplayName("Vérifie que le seuil de 18h d'absence déclenche automatiquement l'élimination de l'examen")
    void testGetEtudiantsSeuilCritique_DeclencheEliminationApres18Heures() {
        Groupe groupe = Groupe.builder().codeGroupe("5A-IIR-G1").build();
        Etudiant etudiant = Etudiant.builder()
                .matricule("EMSI-2026-001")
                .nom("Benjelloun")
                .prenom("Anas")
                .groupe(groupe)
                .build();

        // 10 absences de 2 heures = 20 heures (> 18h seuil éliminatoire EMSI)
        List<Absence> absences = List.of(
                Absence.builder().etudiant(etudiant).heuresAbsence(BigDecimal.valueOf(10.0)).dateSeance(LocalDate.now()).statut(StatutAbsence.ABSENT_NON_JUSTIFIE).build(),
                Absence.builder().etudiant(etudiant).heuresAbsence(BigDecimal.valueOf(10.0)).dateSeance(LocalDate.now().minusDays(1)).statut(StatutAbsence.ABSENT_NON_JUSTIFIE).build()
        );

        when(absenceRepository.findAll()).thenReturn(absences);

        List<EtudiantAlerteAbsenceDto> alertes = absenceService.getEtudiantsSeuilCritique();

        assertEquals(1, alertes.size());
        EtudiantAlerteAbsenceDto alerte = alertes.getFirst();
        assertEquals(BigDecimal.valueOf(20.0), alerte.getTotalHeuresAbsence());
        assertTrue(alerte.getSeuilEliminatoireAtteint());
        assertTrue(alerte.getSanctionPrevue().contains("Élimination Examen"));
    }
}
