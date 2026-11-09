package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Groupe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupeRepository extends JpaRepository<Groupe, Long>, JpaSpecificationExecutor<Groupe> {

    @EntityGraph(attributePaths = {"filiere", "campusFixe"})
    Optional<Groupe> findByCodeGroupe(String codeGroupe);

    boolean existsByCodeGroupe(String codeGroupe);

    @EntityGraph(attributePaths = {"filiere", "campusFixe"})
    Page<Groupe> findByCampusFixeId(Long campusId, Pageable pageable);

    @EntityGraph(attributePaths = {"filiere", "campusFixe"})
    Page<Groupe> findByFiliereId(Long filiereId, Pageable pageable);

    @EntityGraph(attributePaths = {"filiere", "campusFixe"})
    List<Groupe> findByCampusFixeIdAndAnneeEtude(Long campusId, Integer anneeEtude);
}
