package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.ExamenAffectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamenAffectationRepository extends JpaRepository<ExamenAffectation, Long> {

    @Query("SELECT ea FROM ExamenAffectation ea " +
           "JOIN FETCH ea.examen e " +
           "JOIN FETCH ea.etudiant et " +
           "JOIN FETCH ea.salle s " +
           "WHERE ea.examen.id = :examenId " +
           "ORDER BY ea.numeroPlace ASC")
    List<ExamenAffectation> findByExamenIdOrderByNumeroPlaceAsc(@Param("examenId") Long examenId);

    List<ExamenAffectation> findByEtudiantIdOrderByExamenDateExamenAsc(Long etudiantId);

    @Query("SELECT ea FROM ExamenAffectation ea " +
           "JOIN FETCH ea.examen e " +
           "JOIN FETCH e.module m " +
           "JOIN FETCH e.groupe g " +
           "JOIN FETCH ea.salle s " +
           "JOIN FETCH ea.etudiant et " +
           "WHERE LOWER(et.email) = LOWER(:email) " +
           "ORDER BY e.dateExamen ASC, e.heureDebut ASC")
    List<ExamenAffectation> findByEtudiantEmailWithDetails(@Param("email") String email);

    @Query("SELECT ea FROM ExamenAffectation ea " +
           "JOIN FETCH ea.examen e " +
           "JOIN FETCH e.module m " +
           "JOIN FETCH e.groupe g " +
           "JOIN FETCH ea.salle s " +
           "JOIN FETCH ea.etudiant et " +
           "WHERE et.id = :etudiantId " +
           "ORDER BY e.dateExamen ASC, e.heureDebut ASC")
    List<ExamenAffectation> findByEtudiantIdWithDetails(@Param("etudiantId") Long etudiantId);

    Optional<ExamenAffectation> findByExamenIdAndEtudiantId(Long examenId, Long etudiantId);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ExamenAffectation ea WHERE ea.examen.id = :examenId")
    void deleteByExamenId(@Param("examenId") Long examenId);
}
