package ma.emsi.academic.dto.salle;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.TypeSalle;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalleDto {
    private Long id;
    private Long campusId;
    private String campusNom;
    private String codeSalle;
    private TypeSalle typeSalle;
    private Integer capacite;
    private Integer nombrePcOperationnels;
    private String specsEquipements;
    private String horairesOuverture;
    private Boolean estDisponible;
}
