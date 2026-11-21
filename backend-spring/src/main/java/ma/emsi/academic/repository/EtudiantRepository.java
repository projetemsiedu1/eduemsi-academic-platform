package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Etudiant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long>, JpaSpecificationExecutor<Etudiant> {
    boolean existsByGroupeId(Long groupeId);

    @EntityGraph(attributePaths = {"groupe"})
    Optional<Etudiant> findByMatricule(String matricule);

    @EntityGraph(attributePaths = {"groupe"})
    Optional<Etudiant> findByEmail(String email);

    boolean existsByMatricule(String matricule);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"groupe"})
    Page<Etudiant> findByGroupeId(Long groupeId, Pageable pageable);

    @EntityGraph(attributePaths = {"groupe"})
    Page<Etudiant> findByEstRadieExamenTrue(Pageable pageable);

    @Query("SELECT COUNT(e) FROM Etudiant e WHERE e.estRadieExamen = true")
    long countEtudiantsRadies();
}
