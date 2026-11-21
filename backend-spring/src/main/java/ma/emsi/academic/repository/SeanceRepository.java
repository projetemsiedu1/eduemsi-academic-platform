package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Seance;
import ma.emsi.academic.domain.enums.CreneauHoraire;
import ma.emsi.academic.domain.enums.JourSemaine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeanceRepository extends JpaRepository<Seance, Long>, JpaSpecificationExecutor<Seance> {
    boolean existsByGroupeId(Long groupeId);

    @EntityGraph(attributePaths = {"groupe", "salle", "enseignant", "elementModule"})
    List<Seance> findByGroupeIdOrderByJourSemaineAscNumeroCreneauAsc(Long groupeId);

    @EntityGraph(attributePaths = {"groupe", "salle", "enseignant", "elementModule"})
    List<Seance> findByEnseignantIdOrderByJourSemaineAscNumeroCreneauAsc(Long enseignantId);

    @EntityGraph(attributePaths = {"groupe", "salle", "enseignant", "elementModule"})
    List<Seance> findBySalleIdOrderByJourSemaineAscNumeroCreneauAsc(Long salleId);

    @EntityGraph(attributePaths = {"groupe", "salle", "enseignant", "elementModule"})
    Page<Seance> findByGroupeId(Long groupeId, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Seance s " +
           "WHERE s.salle.id = :salleId AND s.jourSemaine = :jour AND s.numeroCreneau = :creneau")
    boolean existsSalleConflit(@Param("salleId") Long salleId, @Param("jour") JourSemaine jour, @Param("creneau") CreneauHoraire creneau);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Seance s " +
           "WHERE s.enseignant.id = :enseignantId AND s.jourSemaine = :jour AND s.numeroCreneau = :creneau")
    boolean existsEnseignantConflit(@Param("enseignantId") Long enseignantId, @Param("jour") JourSemaine jour, @Param("creneau") CreneauHoraire creneau);
}
