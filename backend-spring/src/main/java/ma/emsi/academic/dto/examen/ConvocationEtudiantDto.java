package ma.emsi.academic.dto.examen;

import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;

@Builder
public record ConvocationEtudiantDto(
        Long affectationId,
        Long examenId,
        String moduleCode,
        String moduleNom,
        String filiereNom,
        String session,
        LocalDate dateExamen,
        LocalTime heureDebut,
        LocalTime heureFin,
        Integer dureeMinutes,
        String salleCode,
        String campusNom,
        Integer numeroPlace,
        String codePlace,
        String surveillantPrincipalNom,
        String consignes,
        String statutPresence,
        Boolean notifie,
        Boolean estRadie
) {}
