package ma.emsi.academic.dto.module;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.TypeSalle;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementModuleDto {
    private Long id;
    private String codeElement;
    private String intitule;
    private Integer volumeHoraire;
    private TypeSalle typeSalleRequis;
    private Long enseignantId;
    private String enseignantNomComplet;
}
