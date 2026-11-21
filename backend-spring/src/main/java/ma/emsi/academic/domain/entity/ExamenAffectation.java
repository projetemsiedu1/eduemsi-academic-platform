package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "examen_affectations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_aff_examen_place", columnNames = {"examen_id", "salle_id", "numero_place"}),
        @UniqueConstraint(name = "uk_aff_examen_etudiant", columnNames = {"examen_id", "etudiant_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamenAffectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "examen_id", nullable = false)
    private Examen examen;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @Column(name = "numero_place", nullable = false)
    private Integer numeroPlace;

    @Column(name = "code_place", nullable = false, length = 50)
    private String codePlace;

    @Column(name = "statut_presence", nullable = false, length = 30)
    @Builder.Default
    private String statutPresence = "CONVOQUE";

    @Column(name = "notifie", nullable = false)
    @Builder.Default
    private Boolean notifie = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
