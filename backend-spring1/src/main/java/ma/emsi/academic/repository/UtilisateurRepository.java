package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Utilisateur;
import ma.emsi.academic.domain.enums.RoleEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    @EntityGraph(attributePaths = {"campus"})
    Optional<Utilisateur> findByUsername(String username);

    @EntityGraph(attributePaths = {"campus"})
    Optional<Utilisateur> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"campus"})
    Page<Utilisateur> findByRole(RoleEnum role, Pageable pageable);
}
