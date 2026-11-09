package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pfe_jurys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"pfeProjet", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
@EqualsAndHashCode(callSuper = false, exclude = {"pfeProjet", "encadrant", "rapporteur", "examinateurIa", "presidentHdr", "salleSoutenance"})
public class PfeJury extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pfe_projet_id", nullable = false, unique = true)
    private PfeProject pfeProjet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "encadrant_id", nullable = false)
    private Enseignant encadrant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rapporteur_id", nullable = false)
    private Enseignant rapporteur;

    /**
     * Membre du jury recommandé par l'agent IA (Gemini 2.0 Flash) selon la spécialité NLP/Vision/Cloud
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "examinateur_ia_id", nullable = false)
    private Enseignant examinateurIa;

    /**
     * Président du Jury (Statut HDR ou Docteur requis par la réglementation académique EMSI)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "president_hdr_id", nullable = false)
    private Enseignant presidentHdr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_soutenance_id")
    private Salle salleSoutenance;

    @Column(name = "date_soutenance")
    private LocalDateTime dateSoutenance;

    @Column(name = "score_affinite_ia", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal scoreAffiniteIa = BigDecimal.valueOf(0.95);

    @Column(name = "justification_ia", columnDefinition = "TEXT")
    private String justificationIa;
}
