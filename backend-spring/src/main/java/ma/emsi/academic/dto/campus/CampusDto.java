package ma.emsi.academic.dto.campus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusDto {
    private Long id;
    private String nom;
    private String adresse;
    private String ville;
    private Integer nombreSalles;
    private Integer nombreGroupes;
}
