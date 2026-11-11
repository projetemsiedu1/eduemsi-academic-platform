package ma.emsi.academic.dto.salle;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.TypeSalle;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSalleRequest {

    @NotNull(message = "L'ID du campus est obligatoire")
    private Long campusId;

    @NotBlank(message = "Le code de la salle est obligatoire (ex: LI 8, LR Targa, Salle R)")
    private String codeSalle;

    @NotNull(message = "Le type de salle est obligatoire (STANDARD, LI_PC, LR_RESEAUX, AMPHI)")
    private TypeSalle typeSalle;

    @NotNull(message = "La capacité est obligatoire")
    @Min(value = 1, message = "La capacité doit être d'au moins 1 place")
    private Integer capacite;

    @Builder.Default
    private Integer nombrePcOperationnels = 0;

    private String specsEquipements;

    @Builder.Default
    private String horairesOuverture = "Séances S1 à S6 (08h30 - 18h45)";

    @Builder.Default
    private Boolean estDisponible = true;
}
