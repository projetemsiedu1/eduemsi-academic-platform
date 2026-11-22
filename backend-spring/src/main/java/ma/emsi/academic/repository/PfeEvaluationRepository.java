package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.PfeEvaluation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PfeEvaluationRepository extends JpaRepository<PfeEvaluation, Long> {

    @EntityGraph(attributePaths = {"evaluateur"})
    List<PfeEvaluation> findByPfeProjetIdOrderByIdAsc(Long pfeProjetId);

    @EntityGraph(attributePaths = {"evaluateur"})
    Optional<PfeEvaluation> findByPfeProjetIdAndEvaluateurId(Long pfeProjetId, Long evaluateurId);

    long countByPfeProjetId(Long pfeProjetId);
}
