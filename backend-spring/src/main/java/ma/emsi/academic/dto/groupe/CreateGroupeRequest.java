package ma.emsi.academic.dto.groupe;

import jakarta.validation.constraints.Max;
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
public class CreateGroupeRequest {

    @NotNull(message = "La filière est obligatoire")
    private Long filiereId;

    @NotNull(message = "Le campus fixe d'affectation est obligatoire (Règle EMSI)")
    private Long campusFixeId;

    @NotBlank(message = "Le code groupe est obligatoire (ex: 2DSI G3)")
    @jakarta.validation.constraints.Size(max=50, message="Le code du groupe est limité à 50 caractères.")
    private String codeGroupe;

    @NotNull(message = "L'année d'étude est obligatoire (1 à 5)")
    @Min(value=1, message="L’année d’étude doit être comprise entre 1 et 5.")
    @Max(value=5, message="L’année d’étude doit être comprise entre 1 et 5.")
    private Integer anneeEtude;

    private String optionSpecialite;

    @NotNull(message = "L'effectif du groupe est obligatoire")
    @Min(value = 1, message = "L'effectif doit être au minimum 1")
    @Max(value=1000, message="L’effectif est limité à 1000 étudiants par groupe.")
    private Integer effectif;

    private String delegueNom;

    @Builder.Default
    private String laboratoiresRequis = "LI_PC";
}
