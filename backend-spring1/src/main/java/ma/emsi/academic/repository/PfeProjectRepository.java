package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.PfeProject;
import ma.emsi.academic.domain.enums.StatutPfe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PfeProjectRepository extends JpaRepository<PfeProject, Long>, JpaSpecificationExecutor<PfeProject> {

    @EntityGraph(attributePaths = {"filiere", "jury"})
    Page<PfeProject> findByFiliereId(Long filiereId, Pageable pageable);

    @EntityGraph(attributePaths = {"filiere", "jury"})
    Page<PfeProject> findByStatut(StatutPfe statut, Pageable pageable);

    List<PfeProject> findByStatut(StatutPfe statut);

    long countByStatut(StatutPfe statut);
}
