package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Absence;
import ma.emsi.academic.domain.enums.StatutAbsence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long>, JpaSpecificationExecutor<Absence> {

    @EntityGraph(attributePaths = {"etudiant", "seance", "seance.elementModule"})
    Page<Absence> findByEtudiantId(Long etudiantId, Pageable pageable);

    @EntityGraph(attributePaths = {"etudiant", "seance"})
    List<Absence> findBySeanceIdAndDateSeance(Long seanceId, LocalDate dateSeance);

    @Query("SELECT COALESCE(SUM(a.heuresAbsence), 0) FROM Absence a WHERE a.etudiant.id = :etudiantId AND a.statut = 'ABSENT_NON_JUSTIFIE'")
    BigDecimal sumHeuresNonJustifiees(@Param("etudiantId") Long etudiantId);

    long countByStatut(StatutAbsence statut);
}
