package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.PfeProject;
import ma.emsi.academic.domain.enums.StatutPfe;
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
public interface PfeProjectRepository extends JpaRepository<PfeProject, Long>, JpaSpecificationExecutor<PfeProject> {

    @EntityGraph(attributePaths = {"filiere", "jury", "jury.encadrant", "jury.rapporteur", "jury.examinateurIa", "jury.presidentHdr", "jury.salleSoutenance", "etudiant1", "etudiant2", "encadrantSouhaite", "sujetCatalogue"})
    @Query("SELECT p FROM PfeProject p ORDER BY p.id DESC")
    List<PfeProject> findAllWithDetails();

    @EntityGraph(attributePaths = {"filiere", "jury", "jury.encadrant", "jury.rapporteur", "jury.examinateurIa", "jury.presidentHdr", "jury.salleSoutenance", "etudiant1", "etudiant2", "encadrantSouhaite", "sujetCatalogue"})
    @Query("SELECT p FROM PfeProject p WHERE p.statut = :statut ORDER BY p.id DESC")
    List<PfeProject> findByStatutWithDetails(@Param("statut") StatutPfe statut);

    @EntityGraph(attributePaths = {"filiere", "jury", "jury.encadrant", "jury.rapporteur", "jury.examinateurIa", "jury.presidentHdr", "jury.salleSoutenance", "etudiant1", "etudiant2", "encadrantSouhaite", "sujetCatalogue"})
    @Query("SELECT p FROM PfeProject p WHERE p.id = :id")
    Optional<PfeProject> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"filiere", "jury", "jury.encadrant", "jury.rapporteur", "jury.examinateurIa", "jury.presidentHdr", "jury.salleSoutenance", "etudiant1", "etudiant2", "encadrantSouhaite", "sujetCatalogue"})
    @Query("SELECT p FROM PfeProject p WHERE (p.etudiant1.id = :etudiantId OR p.etudiant2.id = :etudiantId) AND p.statut <> :excluded ORDER BY p.id DESC")
    List<PfeProject> findActiveByEtudiantId(@Param("etudiantId") Long etudiantId, @Param("excluded") StatutPfe excluded);

    @EntityGraph(attributePaths = {"filiere", "jury", "jury.encadrant", "jury.rapporteur", "jury.examinateurIa", "jury.presidentHdr", "jury.salleSoutenance", "etudiant1", "etudiant2", "encadrantSouhaite", "sujetCatalogue"})
    @Query("SELECT p FROM PfeProject p WHERE p.etudiant1.id = :etudiantId OR p.etudiant2.id = :etudiantId ORDER BY p.id DESC")
    List<PfeProject> findAllByEtudiantIdOrderByIdDesc(@Param("etudiantId") Long etudiantId);

    long countBySujetCatalogueIdAndStatutNot(Long sujetCatalogueId, StatutPfe excluded);

    long countBySujetCatalogueId(Long sujetCatalogueId);

    @EntityGraph(attributePaths = {"filiere", "jury"})
    Page<PfeProject> findByFiliereId(Long filiereId, Pageable pageable);

    @EntityGraph(attributePaths = {"filiere", "jury"})
    Page<PfeProject> findByStatut(StatutPfe statut, Pageable pageable);

    List<PfeProject> findByStatut(StatutPfe statut);

    long countByStatut(StatutPfe statut);
}
