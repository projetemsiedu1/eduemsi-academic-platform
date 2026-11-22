package ma.emsi.academic.dto.pfe;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSujetCatalogueRequest {
    @NotNull(message = "La filière cible est obligatoire")
    private Long filiereId;

    @NotBlank(message = "Le titre du sujet est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    private String technologies;

    @Min(value = 1, message = "Le nombre de places doit être au moins 1")
    @Builder.Default
    private Integer placesMax = 1;

    private Boolean estDisponible;
}
