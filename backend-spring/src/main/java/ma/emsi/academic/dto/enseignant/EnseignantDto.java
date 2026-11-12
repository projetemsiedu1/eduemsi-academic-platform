package ma.emsi.academic.dto.enseignant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.TypeContrat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnseignantDto {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String specialite;
    private TypeContrat typeContrat;
    private Integer heuresContractuellesSemaine;
    private Integer heuresPlanifiees;
    private Boolean estActif;
}
