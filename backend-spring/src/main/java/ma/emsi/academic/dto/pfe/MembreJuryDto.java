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
public class MembreJuryDto {

    @Schema(description = "Identifiant de l'enseignant")
    private String id;

    @Schema(description = "Nom complet de l'enseignant", example = "Pr. Ait Ounejjar Lahoussaine")
    private String nom;

    @Schema(description = "Prénom de l'enseignant")
    private String prenom;

    @Schema(description = "Rôle académique dans le jury", example = "Président HDR")
    private String role; // "Encadrant", "Rapporteur", "Examinateur IA", "Président HDR"

    @Schema(description = "Grade académique", example = "Professeur Habilité / HDR")
    private String grade;

    @Schema(description = "Spécialité / Domaine d'expertise", example = "Génie Logiciel / Systèmes Distribués / Kubernetes")
    private String specialite;

    @Schema(description = "Département EMSI", example = "IIR (Informatique)")
    private String departement;

    @Schema(description = "Statut contractuel", example = "PERMANENT")
    private String statut; // "PERMANENT", "VACATAIRE"

    @Schema(description = "Score d'affinité sémantique avec le sujet PFE (en %)", example = "96.5")
    private Double scoreAffinite;
}
