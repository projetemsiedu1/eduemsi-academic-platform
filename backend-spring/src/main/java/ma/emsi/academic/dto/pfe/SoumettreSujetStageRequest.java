package ma.emsi.academic.dto.pfe;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoumettreSujetStageRequest {
    @NotBlank(message = "Le titre du sujet de PFE est obligatoire")
    private String titre;

    @NotBlank(message = "Le résumé / cahier des charges est obligatoire")
    private String resume;

    private String technologiesCles;

    @NotBlank(message = "L'entreprise d'accueil est obligatoire pour un sujet de stage")
    private String entrepriseAccueil;

    private Long binomeEtudiantId;

    private Long encadrantSouhaiteId;
}
