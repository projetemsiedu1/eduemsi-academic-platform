package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Filiere;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FiliereRepository extends JpaRepository<Filiere, Long>, JpaSpecificationExecutor<Filiere> {
    Optional<Filiere> findByCode(String code);
    boolean existsByCode(String code);
    Page<Filiere> findByLibelleContainingIgnoreCase(String query, Pageable pageable);
}
