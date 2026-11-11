package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Campus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CampusRepository extends JpaRepository<Campus, Long>, JpaSpecificationExecutor<Campus> {
    Optional<Campus> findByNom(String nom);
    boolean existsByNom(String nom);
    Page<Campus> findByVilleIgnoreCase(String ville, Pageable pageable);
}
