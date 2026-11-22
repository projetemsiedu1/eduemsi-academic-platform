package ma.emsi.academic.dto.pfe;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValiderSujetRequest {
    @NotNull(message = "La décision (accepte = true/false) est obligatoire")
    private Boolean accepte;

    private String commentaire;
}
