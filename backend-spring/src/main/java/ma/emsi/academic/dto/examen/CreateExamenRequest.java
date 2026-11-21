package ma.emsi.academic.dto.examen;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.SessionExamen;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExamenRequest {

    @NotNull(message = "L'identifiant du module est obligatoire")
    @Positive
    private Long moduleId;

    @NotNull(message = "L'identifiant du groupe est obligatoire")
    @Positive
    private Long groupeId;

    @NotNull(message = "L'identifiant de la salle est obligatoire")
    @Positive
    private Long salleId;

    @NotNull(message = "Le surveillant principal est obligatoire")
    @Positive
    private Long surveillantPrincipalId;

    private Long surveillantSecondaireId;

    @NotNull(message = "La date de l'examen est obligatoire")
    private LocalDate dateExamen;

    @NotNull(message = "L'heure de début est obligatoire")
    private LocalTime heureDebut;

    @Builder.Default
    private Integer dureeMinutes = 120;

    @Builder.Default
    private SessionExamen session = SessionExamen.NORMALE;

    private String consignes;
}
