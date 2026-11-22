package ma.emsi.academic.dto.module;

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
public class CreateModuleRequest {
    @NotNull(message = "L'ID de la filière est obligatoire")
    private Long filiereId;

    @NotBlank(message = "Le code du module est obligatoire")
    private String codeModule;

    @NotBlank(message = "L'intitulé du module est obligatoire")
    private String intitule;

    @Builder.Default
    private String semestre = "S1";

    @Min(value = 1, message = "Le volume horaire doit être positif")
    @Builder.Default
    private Integer volumeHoraireTotal = 90;
}
