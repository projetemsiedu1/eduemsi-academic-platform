package ma.emsi.academic.dto.pfe;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchJuryResponse {

    @Schema(description = "Sujet ou titre du projet PFE", example = "Plateforme Microservices & Orchestration Kubernetes")
    private String sujet;

    @Schema(description = "Résumé ou description succincte", example = "Architecture cloud-native et déploiement Kubernetes")
    private String resume;

    @Schema(description = "Technologies identifiées", example = "Java, Spring Boot, Docker, Kubernetes")
    private String technologies;

    @Schema(description = "Composition officielle des 4 membres du jury")
    private JuryMembresDto jury;

    @Schema(description = "Score global de compatibilité IA (en %)", example = "95.5")
    private Double scoreMatching;

    @Schema(description = "Explication et validation de la règle d'éthique académique BR-PFE-07")
    private String justification;

    @Schema(description = "Modèle LLM ayant effectué l'analyse sémantique", example = "google/gemini-2.0-flash-exp:free (OpenRouter)")
    private String modeleUtilise;

    @Schema(description = "Statut de conformité", example = "CONFORME_BR_PFE_07")
    private String statut;

    @Schema(description = "Détails d'affinité sémantique et métadonnées d'exécution")
    private Map<String, Object> details;
}
