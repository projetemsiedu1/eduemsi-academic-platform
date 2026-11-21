package ma.emsi.academic.domain.solver;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "planning_qualifications", uniqueConstraints = @UniqueConstraint(columnNames = {"enseignant_id", "module_id"}))
@Getter @Setter
public class TeacherQualification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "enseignant_id", nullable = false) private Long enseignantId;
    @Column(name = "module_id", nullable = false) private Long moduleId;
}
