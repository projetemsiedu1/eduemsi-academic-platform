package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.RoleEnum;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs", indexes = {
        @Index(name = "idx_user_username", columnList = "username"),
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_role", columnList = "role")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true, length = 60)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "nom", nullable = false, length = 80)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 80)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 40)
    private RoleEnum role;

    @Builder.Default
    @Column(name = "actif", nullable = false)
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campus_id")
    private Campus campus;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
}
