package ma.emsi.academic.dto.planning;
import jakarta.validation.constraints.*;
import ma.emsi.academic.domain.enums.TypeSalle;
public record CreatePlanningModuleRequest(@NotBlank @Size(max=40) String code, @NotBlank @Size(max=150) String intitule,
        @NotNull @Positive Long filiereId, @Pattern(regexp="S[12]") @NotNull String semestre,
        @Min(1) @Max(600) int volumeHoraire, @NotNull TypeSalle typeSalleRequis) {}
