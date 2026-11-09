package ma.emsi.academic.dto.absence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantAlerteAbsenceDto {
    private Long etudiantId;
    private String matricule;
    private String nom;
    private String prenom;
    private String groupeNom;
    private BigDecimal totalHeuresAbsence;
    private Double pourcentageAbsence;
    private Boolean seuilEliminatoireAtteint; // True si >= 20% ou >= 18h
    private String sanctionPrevue; // "Exclusion Examen", "Avertissement 1", "Normal"
}
