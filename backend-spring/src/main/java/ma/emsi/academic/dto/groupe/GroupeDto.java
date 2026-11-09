package ma.emsi.academic.dto.groupe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeDto {
    private Long id;
    private Long filiereId;
    private String filiereCode;
    private String filiereLibelle;
    private Long campusFixeId;
    private String campusFixeNom;
    private String codeGroupe;
    private Integer anneeEtude;
    private String optionSpecialite;
    private Integer effectif;
    private String delegueNom;
    private String laboratoiresRequis;
}
