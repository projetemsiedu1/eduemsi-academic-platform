package ma.emsi.academic.dto.pfe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationPfeDto {
    private Long id;
    private Long pfeProjetId;
    private Long evaluateurId;
    private String evaluateurNomComplet;
    private String evaluateurGrade;
    private String roleJury;
    private BigDecimal noteTechnique;
    private BigDecimal noteRapport;
    private BigDecimal noteDemo;
    private BigDecimal noteReponses;
    private BigDecimal total;
    private String commentaire;
}
