package ma.emsi.academic.dto.pfe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChoisirSujetRequest {
    private Long binomeEtudiantId;
}
