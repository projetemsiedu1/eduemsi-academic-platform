package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.ElementModule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ElementModuleRepository extends JpaRepository<ElementModule, Long>, JpaSpecificationExecutor<ElementModule> {

    @EntityGraph(attributePaths = {"module"})
    Optional<ElementModule> findByCodeElement(String codeElement);

    boolean existsByCodeElement(String codeElement);

    @EntityGraph(attributePaths = {"module"})
    Page<ElementModule> findByModuleId(Long moduleId, Pageable pageable);
}
