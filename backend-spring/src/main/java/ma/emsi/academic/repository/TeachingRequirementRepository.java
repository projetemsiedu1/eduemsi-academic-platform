package ma.emsi.academic.repository;
import ma.emsi.academic.domain.solver.TeachingRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TeachingRequirementRepository extends JpaRepository<TeachingRequirement, Long> {
    boolean existsByGroupeId(Long groupeId);
    boolean existsByEnseignantId(Long enseignantId);
}
