package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.math.BigDecimal;

@Entity
@Table(name = "pfe_evaluations",
        uniqueConstraints = @UniqueConstraint(name = "uk_eval_pfe_evaluateur", columnNames = {"pfe_projet_id", "evaluateur_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"pfeProjet", "evaluateur"})
@EqualsAndHashCode(callSuper = false, exclude = {"pfeProjet", "evaluateur"})
public class PfeEvaluation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pfe_projet_id", nullable = false)
    private PfeProject pfeProjet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluateur_id", nullable = false)
    private Enseignant evaluateur;

    @Column(name = "role_jury", nullable = false, length = 30)
    private String roleJury;

    @Column(name = "note_technique", nullable = false, precision = 4, scale = 2)
    private BigDecimal noteTechnique;

    @Column(name = "note_rapport", nullable = false, precision = 4, scale = 2)
    private BigDecimal noteRapport;

    @Column(name = "note_demo", nullable = false, precision = 4, scale = 2)
    private BigDecimal noteDemo;

    @Column(name = "note_reponses", nullable = false, precision = 4, scale = 2)
    private BigDecimal noteReponses;

    @Column(name = "total", nullable = false, precision = 4, scale = 2)
    private BigDecimal total;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;
}
