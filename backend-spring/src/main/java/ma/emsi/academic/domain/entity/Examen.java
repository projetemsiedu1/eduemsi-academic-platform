package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.enums.SessionExamen;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "examens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Examen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "groupe_id", nullable = false)
    private Groupe groupe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "surveillant_principal_id", nullable = false)
    private Enseignant surveillantPrincipal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "surveillant_secondaire_id")
    private Enseignant surveillantSecondaire;

    @Column(name = "date_examen", nullable = false)
    private LocalDate dateExamen;

    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;

    @Column(name = "duree_minutes", nullable = false)
    @Builder.Default
    private Integer dureeMinutes = 120;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_examen", nullable = false, length = 20)
    @Builder.Default
    private SessionExamen session = SessionExamen.NORMALE;

    @Column(columnDefinition = "TEXT")
    private String consignes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
