package ma.emsi.academic.dto.examen;

import lombok.Builder;

@Builder
public record ExamenAffectationDto(
        Long id,
        Long examenId,
        Long etudiantId,
        String etudiantNom,
        String etudiantPrenom,
        String etudiantMatricule,
        String etudiantEmail,
        String groupeCode,
        Long salleId,
        String salleCode,
        Integer numeroPlace,
        String codePlace,
        String statutPresence,
        Boolean notifie,
        Boolean estRadie
) {}
