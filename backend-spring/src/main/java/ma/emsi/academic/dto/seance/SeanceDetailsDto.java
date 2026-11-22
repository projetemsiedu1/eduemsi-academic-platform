package ma.emsi.academic.dto.seance;

import lombok.Builder;

@Builder
public record SeanceDetailsDto(
        Long id,
        Long groupeId,
        String groupeNom,
        Long salleId,
        String salleCode,
        String campusNom,
        Long enseignantId,
        String enseignantNom,
        Long elementModuleId,
        String elementModuleCode,
        String elementModuleIntitule,
        String moduleNom,
        String jourSemaine,
        String numeroCreneau,
        String horaireDebut,
        String horaireFin,
        Integer dureeMinutes,
        String typeSalle
) {}
