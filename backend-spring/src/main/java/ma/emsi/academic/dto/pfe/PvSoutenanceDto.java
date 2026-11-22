package ma.emsi.academic.dto.pfe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PvSoutenanceDto {
    private PfeProjectDto projet;
    private List<String> etudiants;
    private List<MembreJuryDto> jury;
    private List<EvaluationPfeDto> evaluations;
    private BigDecimal noteFinale;
    private String mention;
    private LocalDateTime dateSoutenance;
    private String salle;
    private String campus;
    private Boolean pvVerrouille;
    private LocalDateTime dateVerrouillage;
}
