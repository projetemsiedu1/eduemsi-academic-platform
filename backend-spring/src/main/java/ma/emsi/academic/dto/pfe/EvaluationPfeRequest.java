package ma.emsi.academic.dto.pfe;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationPfeRequest {

    @NotNull(message = "La note technique (/6) est obligatoire")
    @DecimalMin(value = "0.0", message = "La note technique ne peut pas être négative")
    @DecimalMax(value = "6.0", message = "La note technique maximale est 6.0")
    private BigDecimal noteTechnique;

    @NotNull(message = "La note de rapport (/5) est obligatoire")
    @DecimalMin(value = "0.0", message = "La note de rapport ne peut pas être négative")
    @DecimalMax(value = "5.0", message = "La note de rapport maximale est 5.0")
    private BigDecimal noteRapport;

    @NotNull(message = "La note de présentation & démo (/5) est obligatoire")
    @DecimalMin(value = "0.0", message = "La note de présentation ne peut pas être négative")
    @DecimalMax(value = "5.0", message = "La note de présentation maximale est 5.0")
    private BigDecimal noteDemo;

    @NotNull(message = "La note des réponses aux questions (/4) est obligatoire")
    @DecimalMin(value = "0.0", message = "La note des réponses ne peut pas être négative")
    @DecimalMax(value = "4.0", message = "La note des réponses maximale est 4.0")
    private BigDecimal noteReponses;

    private String commentaire;
}
