package ma.emsi.academic.dto.pfe;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchJuryRequest {

    @Schema(description = "Sujet ou titre du PFE", example = "Plateforme Microservices & Orchestration Kubernetes")
    private String sujet;

    @Schema(description = "Titre alternatif si utilisé", example = "Plateforme Microservices & Orchestration Kubernetes")
    private String titre;

    @Schema(description = "Résumé ou problématique du projet", example = "Développement d'un ERP académique conteneurisé sous Kubernetes avec Spring Boot 3, Angular 18 et OR-Tools.")
    private String resume;

    @Schema(description = "Problématique alternative si utilisée")
    private String problematique;

    @Schema(description = "Technologies clés utilisées", example = "Java, Spring Boot, Angular, Docker, Kubernetes, OR-Tools")
    private String technologies;

    @Schema(description = "Technologies clés alternatives")
    private String technologiesCles;

    @Schema(description = "Encadrant proposé ou désigné", example = "Pr. Ait Ounejjar Lahoussaine")
    private String encadrant;

    @Schema(description = "Nom de l'étudiant ou du binôme", example = "Amine Bella & Yassine Chraibi")
    private String etudiant;

    @Schema(description = "Filière EMSI", example = "5A-IIR")
    private String filiere;

    public String getResolvedSujet() {
        if (sujet != null && !sujet.isBlank()) return sujet.trim();
        if (titre != null && !titre.isBlank()) return titre.trim();
        return "Projet PFE EMSI";
    }

    public String getResolvedResume() {
        if (resume != null && !resume.isBlank()) return resume.trim();
        if (problematique != null && !problematique.isBlank()) return problematique.trim();
        return "";
    }

    public String getResolvedTechnologies() {
        if (technologies != null && !technologies.isBlank()) return technologies.trim();
        if (technologiesCles != null && !technologiesCles.isBlank()) return technologiesCles.trim();
        return "";
    }
}
