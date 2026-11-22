package ma.emsi.academic.dto.absence;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JustifierAbsenceRequest {
    @NotBlank(message = "Le motif ou justification de l'absence est obligatoire")
    private String motif;
}
