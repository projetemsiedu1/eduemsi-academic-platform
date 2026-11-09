package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Salle;
import ma.emsi.academic.domain.enums.TypeSalle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long>, JpaSpecificationExecutor<Salle> {

    @EntityGraph(attributePaths = {"campus"})
    Optional<Salle> findByCodeSalle(String codeSalle);

    boolean existsByCodeSalle(String codeSalle);

    @EntityGraph(attributePaths = {"campus"})
    Page<Salle> findByCampusId(Long campusId, Pageable pageable);

    @EntityGraph(attributePaths = {"campus"})
    Page<Salle> findByTypeSalle(TypeSalle typeSalle, Pageable pageable);

    @EntityGraph(attributePaths = {"campus"})
    Page<Salle> findByCampusIdAndTypeSalle(Long campusId, TypeSalle typeSalle, Pageable pageable);

    @Query("SELECT s FROM Salle s JOIN FETCH s.campus WHERE s.campus.id = :campusId AND s.estDisponible = true AND s.capacite >= :capaciteMin")
    List<Salle> findDisponiblesPourGroupe(@Param("campusId") Long campusId, @Param("capaciteMin") Integer capaciteMin);
}
