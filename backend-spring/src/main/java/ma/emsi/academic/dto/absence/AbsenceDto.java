package ma.emsi.academic.dto.absence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.StatutAbsence;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbsenceDto {
    private Long id;
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantPrenom;
    private String etudiantMatricule;
    private String groupeNom;
    private Long seanceId;
    private String moduleNom;
    private LocalDate dateSeance;
    private StatutAbsence statut;
    private BigDecimal heuresAbsence;
    private String motifJustification;
    private Boolean valideParScolarite;
}
