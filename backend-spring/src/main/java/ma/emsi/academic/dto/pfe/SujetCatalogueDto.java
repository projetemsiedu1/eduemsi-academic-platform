package ma.emsi.academic.dto.pfe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SujetCatalogueDto {
    private Long id;
    private Long enseignantId;
    private String enseignantNomComplet;
    private String enseignantGrade;
    private Long filiereId;
    private String filiereCode;
    private String filiereLibelle;
    private String titre;
    private String description;
    private String technologies;
    private Integer placesMax;
    private Long placesOccupees;
    private Boolean estDisponible;
}
