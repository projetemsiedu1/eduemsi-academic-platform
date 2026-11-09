package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Module;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long>, JpaSpecificationExecutor<Module> {

    @EntityGraph(attributePaths = {"filiere", "elements"})
    Optional<Module> findByCodeModule(String codeModule);

    boolean existsByCodeModule(String codeModule);

    @EntityGraph(attributePaths = {"filiere"})
    Page<Module> findByFiliereId(Long filiereId, Pageable pageable);
}
