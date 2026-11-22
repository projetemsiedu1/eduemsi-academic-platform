package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.PfeJury;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PfeJuryRepository extends JpaRepository<PfeJury, Long>, JpaSpecificationExecutor<PfeJury> {

    @EntityGraph(attributePaths = {"pfeProjet", "pfeProjet.filiere", "pfeProjet.etudiant1", "pfeProjet.etudiant2", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
    Optional<PfeJury> findByPfeProjetId(Long pfeProjetId);

    @EntityGraph(attributePaths = {"pfeProjet", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
    Page<PfeJury> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"pfeProjet", "pfeProjet.filiere", "pfeProjet.etudiant1", "pfeProjet.etudiant2", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
    @Query("SELECT j FROM PfeJury j WHERE j.encadrant.id = :eid OR j.rapporteur.id = :eid OR j.examinateurIa.id = :eid OR j.presidentHdr.id = :eid ORDER BY j.dateSoutenance ASC")
    List<PfeJury> findByMembreId(@Param("eid") Long enseignantId);

    @Query("SELECT j FROM PfeJury j WHERE j.pfeProjet.id <> :excludePfeId AND j.dateSoutenance IS NOT NULL AND j.dateSoutenance > :windowStart AND j.dateSoutenance < :windowEnd")
    List<PfeJury> findSoutenancesInWindow(@Param("excludePfeId") Long excludePfeId,
                                          @Param("windowStart") LocalDateTime windowStart,
                                          @Param("windowEnd") LocalDateTime windowEnd);
}
