package ma.emsi.academic.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.emsi.academic.dto.pfe.MatchJuryRequest;
import ma.emsi.academic.dto.pfe.MatchJuryResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class OpenRouterAiServiceTest {

    private OpenRouterAiService aiService;

    private final List<Map<String, String>> enseignants = List.of(
        Map.of("id", "1", "nom", "Pr. Benassou Noussair", "grade", "Docteur / HDR", "specialite", "Java / Spring Cloud / Microservices / DevOps", "departement", "IIR", "statut", "PERMANENT"),
        Map.of("id", "2", "nom", "Pr. Ait Ounejjar Lahoussaine", "grade", "Professeur Habilité", "specialite", "Génie Logiciel / Systèmes Distribués / Kubernetes", "departement", "IIR", "statut", "PERMANENT"),
        Map.of("id", "3", "nom", "Pr. Zgandri Mohammed", "grade", "Docteur d'État", "specialite", "Data Science / Gouvernance SI / IA", "departement", "IIR", "statut", "PERMANENT"),
        Map.of("id", "4", "nom", "Dr. Alami Karim", "grade", "Docteur", "specialite", "Deep Learning / Vision par Ordinateur / LLM", "departement", "IIR", "statut", "VACATAIRE")
    );

    @BeforeEach
    void setUp() {
        aiService = new OpenRouterAiService(WebClient.builder(), new ObjectMapper());
    }

    @Test
    @DisplayName("Vérifie que le matching retourne 4 membres distincts respectant la règle BR-PFE-07")
    void testMatching4Membres_RespecteRegleEthiqueBR_PFE_07() {
        MatchJuryRequest request = MatchJuryRequest.builder()
                .sujet("Plateforme Microservices Spring Boot & Kubernetes")
                .resume("Architecture distribuée avec haute disponibilité, Docker, API Gateway")
                .technologies("Java, Spring Boot, Docker, Kubernetes")
                .encadrant("Pr. Ait Ounejjar Lahoussaine") // Encadrant désigné
                .build();

        MatchJuryResponse response = aiService.executerFallbackHeuristique4Membres(
                request.getResolvedSujet(),
                request.getResolvedResume(),
                request.getResolvedTechnologies(),
                request.getEncadrant(),
                enseignants
        );

        assertNotNull(response);
        assertNotNull(response.getJury());
        assertNotNull(response.getJury().getEncadrant());
        assertNotNull(response.getJury().getRapporteur());
        assertNotNull(response.getJury().getExaminateurIa());
        assertNotNull(response.getJury().getPresidentHdr());

        // RÈGLE BR-PFE-07 : L'encadrant ne doit pas être rapporteur, examinateur ou président
        String nomEncadrant = response.getJury().getEncadrant().getNom();
        String nomRapporteur = response.getJury().getRapporteur().getNom();
        String nomExaminateur = response.getJury().getExaminateurIa().getNom();
        String nomPresident = response.getJury().getPresidentHdr().getNom();

        assertEquals("Pr. Ait Ounejjar Lahoussaine", nomEncadrant);
        assertNotEquals(nomEncadrant, nomRapporteur, "L'encadrant ne peut pas être le rapporteur !");
        assertNotEquals(nomEncadrant, nomExaminateur, "L'encadrant ne peut pas être l'examinateur !");
        assertNotEquals(nomEncadrant, nomPresident, "L'encadrant ne peut pas être le président !");

        // Tous les 4 membres sont distincts
        assertEquals(4, List.of(nomEncadrant, nomRapporteur, nomExaminateur, nomPresident).stream().distinct().count());

        // Score supérieur à 85%
        assertTrue(response.getScoreMatching() >= 85.0);
        assertTrue(response.getJustification().contains("BR-PFE-07"));
    }
}
