package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Enseignant;
import ma.emsi.academic.domain.enums.TypeContrat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long>, JpaSpecificationExecutor<Enseignant> {

    Optional<Enseignant> findByEmail(String email);

    Optional<Enseignant> findByMatricule(String matricule);

    boolean existsByEmail(String email);

    boolean existsByMatricule(String matricule);

    Page<Enseignant> findByTypeContrat(TypeContrat typeContrat, Pageable pageable);

    List<Enseignant> findByTypeContratAndEstActifTrue(TypeContrat typeContrat);

    long countByTypeContrat(TypeContrat typeContrat);
}
