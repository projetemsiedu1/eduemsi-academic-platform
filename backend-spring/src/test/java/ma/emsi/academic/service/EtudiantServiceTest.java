package ma.emsi.academic.service;

import ma.emsi.academic.domain.entity.Etudiant;
import ma.emsi.academic.domain.entity.Groupe;
import ma.emsi.academic.dto.etudiant.CreateEtudiantRequest;
import ma.emsi.academic.dto.etudiant.EtudiantDto;
import ma.emsi.academic.repository.EtudiantRepository;
import ma.emsi.academic.repository.GroupeRepository;
import ma.emsi.academic.service.impl.EtudiantServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EtudiantServiceTest {

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private GroupeRepository groupeRepository;

    @InjectMocks
    private EtudiantServiceImpl etudiantService;

    @Test
    @DisplayName("Inscription d'un étudiant avec affectation à un groupe")
    void testCreateEtudiant_Success() {
        Groupe groupe = Groupe.builder()
                .codeGroupe("2DSI G3")
                .anneeEtude(5)
                .effectif(32)
                .build();
        groupe.setId(1L);

        CreateEtudiantRequest req = CreateEtudiantRequest.builder()
                .matricule("ETU-2026-001")
                .nom("El Mansouri")
                .prenom("Karim")
                .email("karim.elmansouri@emsi-edu.ma")
                .telephone("0611223344")
                .groupeId(1L)
                .totalHeuresModuleSemestre(BigDecimal.valueOf(90.00))
                .build();

        Etudiant saved = Etudiant.builder()
                .matricule("ETU-2026-001")
                .nom("El Mansouri")
                .prenom("Karim")
                .email("karim.elmansouri@emsi-edu.ma")
                .telephone("0611223344")
                .groupe(groupe)
                .totalHeuresModuleSemestre(BigDecimal.valueOf(90.00))
                .cumulHeuresAbsence(BigDecimal.ZERO)
                .estRadieExamen(false)
                .build();
        saved.setId(101L);

        when(etudiantRepository.existsByMatricule("ETU-2026-001")).thenReturn(false);
        when(etudiantRepository.existsByEmail("karim.elmansouri@emsi-edu.ma")).thenReturn(false);
        when(groupeRepository.findById(1L)).thenReturn(Optional.of(groupe));
        when(etudiantRepository.save(any(Etudiant.class))).thenReturn(saved);

        EtudiantDto result = etudiantService.createEtudiant(req);

        assertNotNull(result);
        assertEquals("ETU-2026-001", result.getMatricule());
        assertEquals("El Mansouri", result.getNom());
        assertEquals("2DSI G3", result.getCodeGroupe());
        assertFalse(result.getEstRadieExamen());
        verify(etudiantRepository).save(any(Etudiant.class));
    }
}
