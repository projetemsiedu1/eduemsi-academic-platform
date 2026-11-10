package ma.emsi.academic.dto.etudiant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantDto {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Long groupeId;
    private String codeGroupe;
    private String nomFiliere;
    private String nomCampus;
    private BigDecimal totalHeuresModuleSemestre;
    private BigDecimal cumulHeuresAbsence;
    private Double tauxAbsence;
    private Boolean estRadieExamen;
}
