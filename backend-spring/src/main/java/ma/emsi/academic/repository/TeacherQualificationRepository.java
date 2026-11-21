package ma.emsi.academic.repository;
import ma.emsi.academic.domain.solver.TeacherQualification;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TeacherQualificationRepository extends JpaRepository<TeacherQualification, Long> {
    boolean existsByEnseignantId(Long enseignantId);
}
