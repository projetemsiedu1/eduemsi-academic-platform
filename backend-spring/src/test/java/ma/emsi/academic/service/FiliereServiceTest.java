package ma.emsi.academic.service;

import ma.emsi.academic.domain.entity.Filiere;
import ma.emsi.academic.dto.filiere.CreateFiliereRequest;
import ma.emsi.academic.dto.filiere.FiliereDto;
import ma.emsi.academic.repository.FiliereRepository;
import ma.emsi.academic.service.impl.FiliereServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FiliereServiceTest {

    @Mock
    private FiliereRepository filiereRepository;

    @InjectMocks
    private FiliereServiceImpl filiereService;

    @Test
    @DisplayName("Création d'une filière avec succès")
    void testCreateFiliere_Success() {
        CreateFiliereRequest req = CreateFiliereRequest.builder()
                .code("5A-GC")
                .libelle("Génie Civil 5ème Année")
                .build();

        Filiere saved = Filiere.builder()
                .code("5A-GC")
                .libelle("Génie Civil 5ème Année")
                .build();
        saved.setId(10L);

        when(filiereRepository.findByCode("5A-GC")).thenReturn(Optional.empty());
        when(filiereRepository.save(any(Filiere.class))).thenReturn(saved);

        FiliereDto result = filiereService.createFiliere(req);

        assertNotNull(result);
        assertEquals("5A-GC", result.getCode());
        assertEquals("Génie Civil 5ème Année", result.getLibelle());
        verify(filiereRepository).save(any(Filiere.class));
    }
}
