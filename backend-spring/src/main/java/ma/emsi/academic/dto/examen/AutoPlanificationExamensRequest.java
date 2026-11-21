package ma.emsi.academic.dto.examen;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.SessionExamen;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoPlanificationExamensRequest {

    @NotNull(message = "La date de début des examens est obligatoire")
    private LocalDate dateDebut;

    @NotNull(message = "Le nombre de jours de la session est obligatoire")
    @Min(value = 1, message = "La session doit durer au moins 1 jour")
    @Max(value = 30, message = "La session ne peut excéder 30 jours")
    @Builder.Default
    private Integer nombreJours = 5;

    @NotNull(message = "Le nombre maximum de modules par jour est obligatoire")
    @Min(value = 1, message = "Au moins 1 module par jour")
    @Max(value = 3, message = "Au maximum 3 modules par jour par étudiant")
    @Builder.Default
    private Integer maxModulesParJour = 1;

    @Builder.Default
    private SessionExamen session = SessionExamen.NORMALE;

    private List<Long> filiereIds;

    @Builder.Default
    private Boolean inclureSamedi = false;

    @Builder.Default
    private Boolean unSurDeux = true;
}
