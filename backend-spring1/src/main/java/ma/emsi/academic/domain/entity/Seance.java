package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.CreneauHoraire;
import ma.emsi.academic.domain.enums.JourSemaine;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "seances",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_seance_salle_jour_creneau", columnNames = {"salle_id", "jour_semaine", "numero_creneau"}),
           @UniqueConstraint(name = "uk_seance_groupe_jour_creneau", columnNames = {"groupe_id", "jour_semaine", "numero_creneau"}),
           @UniqueConstraint(name = "uk_seance_enseignant_jour_creneau", columnNames = {"enseignant_id", "jour_semaine", "numero_creneau"})
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"groupe", "salle", "enseignant", "elementModule", "absences"})
@EqualsAndHashCode(callSuper = false, exclude = {"groupe", "salle", "enseignant", "elementModule", "absences"})
public class Seance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "groupe_id", nullable = false)
    private Groupe groupe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private Enseignant enseignant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "element_module_id", nullable = false)
    private ElementModule elementModule;

    @Enumerated(EnumType.STRING)
    @Column(name = "jour_semaine", nullable = false, length = 20)
    private JourSemaine jourSemaine;

    @Enumerated(EnumType.STRING)
    @Column(name = "numero_creneau", nullable = false, length = 20)
    private CreneauHoraire numeroCreneau;

    @Column(name = "span_seances", nullable = false)
    @Builder.Default
    private Integer spanSeances = 1;

    @Column(name = "statut_affectation", nullable = false, length = 50)
    @Builder.Default
    private String statutAffectation = "OPTIMAL_CPSAT";

    @OneToMany(mappedBy = "seance", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Absence> absences = new ArrayList<>();
}
