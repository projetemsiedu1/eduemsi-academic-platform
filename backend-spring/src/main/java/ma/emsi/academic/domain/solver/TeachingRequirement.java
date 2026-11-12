package ma.emsi.academic.domain.solver;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** Weekly demand, explicitly entered by planning staff; never inferred from semester hours. */
@Entity @Table(name = "planning_requirements", uniqueConstraints = @UniqueConstraint(columnNames = {"groupe_id", "element_id"}))
@Getter @Setter
public class TeachingRequirement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Version private Long version;
    @Column(name = "groupe_id", nullable = false) private Long groupeId;
    @Column(name = "element_id", nullable = false) private Long elementId;
    @Column(name = "enseignant_id", nullable = false) private Long enseignantId;
    @Column(name = "weekly_sessions", nullable = false) private int weeklySessions;
}
