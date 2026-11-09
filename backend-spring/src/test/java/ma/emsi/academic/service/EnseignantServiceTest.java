package ma.emsi.academic.service;

import ma.emsi.academic.domain.entity.Enseignant;
import ma.emsi.academic.domain.enums.TypeContrat;
import ma.emsi.academic.dto.enseignant.EnseignantDto;
import ma.emsi.academic.repository.EnseignantRepository;
import ma.emsi.academic.service.impl.EnseignantServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnseignantServiceTest {

    @Mock
    private EnseignantRepository enseignantRepository;

    @InjectMocks
    private EnseignantServiceImpl enseignantService;

    @Test
    @DisplayName("Filtrage strict des enseignants vacataires (P1 planning)")
    void testGetVacataires_ReturnsOnlyVacataires() {
        Enseignant vacataire = Enseignant.builder()
                .matricule("ENS-VAC-01")
                .nom("Kadiri")
                .prenom("Yassine")
                .typeContrat(TypeContrat.VACATAIRE)
                .heuresContractuellesSemaine(10)
                .build();

        when(enseignantRepository.findByTypeContrat(TypeContrat.VACATAIRE)).thenReturn(List.of(vacataire));

        List<EnseignantDto> result = enseignantService.getEnseignantsByContrat(TypeContrat.VACATAIRE);

        assertEquals(1, result.size());
        assertEquals(TypeContrat.VACATAIRE, result.getFirst().getTypeContrat());
        assertEquals("Kadiri", result.getFirst().getNom());
    }
}
