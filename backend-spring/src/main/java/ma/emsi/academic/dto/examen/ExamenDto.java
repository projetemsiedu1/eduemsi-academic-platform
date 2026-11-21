package ma.emsi.academic.dto.examen;

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
public class ExamenDto {
    private Long id;
    private Long moduleId;
    private String codeModule;
    private String intituleModule;
    private Long groupeId;
    private String codeGroupe;
    private Integer effectifGroupe;
    private Long salleId;
    private String codeSalle;
    private Integer capaciteSalle;
    private String campusNom;
    private Long surveillantPrincipalId;
    private String surveillantPrincipalNom;
    private Long surveillantSecondaireId;
    private String surveillantSecondaireNom;
    private LocalDate dateExamen;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Integer dureeMinutes;
    private SessionExamen session;
    private String consignes;
}
