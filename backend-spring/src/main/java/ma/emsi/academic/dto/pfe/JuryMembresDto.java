package ma.emsi.academic.dto.pfe;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JuryMembresDto {

    @Schema(description = "1. Encadrant pédagogique / industriel du projet PFE")
    private MembreJuryDto encadrant;

    @Schema(description = "2. Rapporteur (Évaluateur technique indépendant, exclu d'encadrement)")
    private MembreJuryDto rapporteur;

    @Schema(description = "3. Examinateur IA (Recommandé selon l'affinité sémantique technologique)")
    private MembreJuryDto examinateurIa;

    @Schema(description = "4. Président HDR (Professeur Habilité / Docteur d'État garant de la rigueur académique)")
    private MembreJuryDto presidentHdr;
}
