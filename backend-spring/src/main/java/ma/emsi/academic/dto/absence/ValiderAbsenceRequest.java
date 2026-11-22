package ma.emsi.academic.dto.absence;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValiderAbsenceRequest {
    @NotNull(message = "L'état de validation (true: acceptée, false: rejetée) est obligatoire")
    private Boolean accepte;
}
