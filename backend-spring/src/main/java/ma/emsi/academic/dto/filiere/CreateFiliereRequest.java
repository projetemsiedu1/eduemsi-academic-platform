package ma.emsi.academic.dto.filiere;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFiliereRequest {

    @NotBlank(message = "Le code de la filière est obligatoire (ex: 5A-IIR)")
    @Size(max = 20, message = "Le code ne peut excéder 20 caractères")
    private String code;

    @NotBlank(message = "Le libellé de la filière est obligatoire")
    @Size(max = 150, message = "Le libellé ne peut excéder 150 caractères")
    private String libelle;
}
