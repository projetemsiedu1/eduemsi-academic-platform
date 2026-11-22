package ma.emsi.academic.dto.pfe;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.StatutPfe;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePfeProjectRequest {
    @NotNull(message = "L'ID de la filière est obligatoire")
    private Long filiereId;

    @NotBlank(message = "Le titre du projet PFE est obligatoire")
    private String titre;

    @NotBlank(message = "Le résumé ou cahier des charges est obligatoire")
    private String resume;

    private String technologiesCles;

    @NotBlank(message = "Les noms du binôme d'étudiants sont obligatoires")
    private String binomeEtudiants;

    @Builder.Default
    private StatutPfe statut = StatutPfe.EN_ATTENTE_JURY;
}
