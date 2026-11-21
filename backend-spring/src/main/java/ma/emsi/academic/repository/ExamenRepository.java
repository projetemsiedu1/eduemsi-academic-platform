package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Examen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ExamenRepository extends JpaRepository<Examen, Long> {

    List<Examen> findByDateExamenOrderByHeureDebutAsc(LocalDate dateExamen);

    List<Examen> findByGroupeId(Long groupeId);

    List<Examen> findByModuleId(Long moduleId);

    @Query("SELECT e FROM Examen e WHERE e.dateExamen = :date AND " +
           "((e.heureDebut < :fin AND e.heureFin > :debut) AND e.salle.id = :salleId)")
    List<Examen> findSalleConflicts(@Param("date") LocalDate date,
                                   @Param("debut") LocalTime debut,
                                   @Param("fin") LocalTime fin,
                                   @Param("salleId") Long salleId);

    @Query("SELECT e FROM Examen e WHERE e.dateExamen = :date AND " +
           "((e.heureDebut < :fin AND e.heureFin > :debut) AND e.groupe.id = :groupeId)")
    List<Examen> findGroupeConflicts(@Param("date") LocalDate date,
                                    @Param("debut") LocalTime debut,
                                    @Param("fin") LocalTime fin,
                                    @Param("groupeId") Long groupeId);

    @Query("SELECT e FROM Examen e WHERE e.dateExamen = :date AND " +
           "((e.heureDebut < :fin AND e.heureFin > :debut) AND " +
           "(e.surveillantPrincipal.id = :ensId OR e.surveillantSecondaire.id = :ensId))")
    List<Examen> findSurveillantConflicts(@Param("date") LocalDate date,
                                         @Param("debut") LocalTime debut,
                                         @Param("fin") LocalTime fin,
                                         @Param("ensId") Long ensId);
}
