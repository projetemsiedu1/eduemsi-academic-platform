package ma.emsi.academic.dto.pfe;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanifierSoutenanceRequest {
    private Long pfeProjetId;

    @NotNull(message = "L'enseignant encadrant est obligatoire")
    private Long encadrantId;

    @NotNull(message = "Le rapporteur est obligatoire")
    private Long rapporteurId;

    @NotNull(message = "L'examinateur IA est obligatoire")
    private Long examinateurIaId;

    @NotNull(message = "Le président HDR est obligatoire")
    private Long presidentHdrId;

    private Long salleSoutenanceId;

    @NotNull(message = "La date et l'heure de soutenance sont obligatoires")
    private LocalDateTime dateSoutenance;

    @Builder.Default
    private BigDecimal scoreAffiniteIa = BigDecimal.valueOf(0.95);

    private String justificationIa;
}
