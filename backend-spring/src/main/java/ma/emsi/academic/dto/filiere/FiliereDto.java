package ma.emsi.academic.dto.filiere;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiliereDto {
    private Long id;
    private String code;
    private String libelle;
    private Integer nombreGroupes;
    private Integer nombreModules;
}
