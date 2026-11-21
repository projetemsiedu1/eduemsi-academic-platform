package ma.emsi.academic.dto.planning;

import jakarta.validation.constraints.*;
import ma.emsi.academic.domain.enums.CreneauHoraire;
import ma.emsi.academic.domain.enums.JourSemaine;

public record SaveSeanceRequest(
        @NotNull @Positive Long groupeId, @NotNull @Positive Long salleId,
        @NotNull @Positive Long enseignantId, @NotNull @Positive Long elementModuleId,
        @NotNull JourSemaine jourSemaine, @NotNull CreneauHoraire numeroCreneau,
        @Min(1) @Max(6) int spanSeances) {}
