package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.PfeSujetCatalogue;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PfeSujetCatalogueRepository extends JpaRepository<PfeSujetCatalogue, Long> {

    @EntityGraph(attributePaths = {"enseignant", "filiere"})
    List<PfeSujetCatalogue> findByEnseignantIdOrderByIdDesc(Long enseignantId);

    @EntityGraph(attributePaths = {"enseignant", "filiere"})
    List<PfeSujetCatalogue> findByFiliereIdAndEstDisponibleTrueOrderByIdDesc(Long filiereId);

    @EntityGraph(attributePaths = {"enseignant", "filiere"})
    List<PfeSujetCatalogue> findByEstDisponibleTrueOrderByIdDesc();

    @EntityGraph(attributePaths = {"enseignant", "filiere"})
    List<PfeSujetCatalogue> findAllByOrderByIdDesc();
}
