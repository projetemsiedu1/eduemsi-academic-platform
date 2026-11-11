package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.PfeJury;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PfeJuryRepository extends JpaRepository<PfeJury, Long>, JpaSpecificationExecutor<PfeJury> {

    @EntityGraph(attributePaths = {"pfeProjet", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
    Optional<PfeJury> findByPfeProjetId(Long pfeProjetId);

    @EntityGraph(attributePaths = {"pfeProjet", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
    Page<PfeJury> findAll(Pageable pageable);
}
