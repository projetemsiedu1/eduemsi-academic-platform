package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.OriginePfe;
import ma.emsi.academic.domain.enums.StatutPfe;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pfe_projets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"filiere", "jury", "sujetCatalogue", "etudiant1", "etudiant2", "encadrantSouhaite", "evaluations"})
@EqualsAndHashCode(callSuper = false, exclude = {"filiere", "jury", "sujetCatalogue", "etudiant1", "etudiant2", "encadrantSouhaite", "evaluations"})
public class PfeProject extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "filiere_id", nullable = false)
    private Filiere filiere;

    @Column(name = "titre", nullable = false, length = 255)
    private String titre;

    @Column(name = "resume", nullable = false, columnDefinition = "TEXT")
    private String resume;

    @Column(name = "technologies_cles", length = 255)
    private String technologiesCles;

    @Column(name = "binome_etudiants", nullable = false, length = 255)
    private String binomeEtudiants;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 50)
    @Builder.Default
    private StatutPfe statut = StatutPfe.EN_ATTENTE_JURY;

    @Enumerated(EnumType.STRING)
    @Column(name = "origine", nullable = false, length = 30)
    @Builder.Default
    private OriginePfe origine = OriginePfe.STAGE_ENTREPRISE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sujet_catalogue_id")
    private PfeSujetCatalogue sujetCatalogue;

    @Column(name = "entreprise_accueil", length = 150)
    private String entrepriseAccueil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant1_id")
    private Etudiant etudiant1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant2_id")
    private Etudiant etudiant2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encadrant_souhaite_id")
    private Enseignant encadrantSouhaite;

    @Column(name = "commentaire_validation", columnDefinition = "TEXT")
    private String commentaireValidation;

    @Column(name = "note_finale", precision = 4, scale = 2)
    private BigDecimal noteFinale;

    @Column(name = "mention", length = 60)
    private String mention;

    @Column(name = "pv_verrouille", nullable = false)
    @Builder.Default
    private Boolean pvVerrouille = false;

    @Column(name = "date_verrouillage")
    private LocalDateTime dateVerrouillage;

    @OneToOne(mappedBy = "pfeProjet", cascade = CascadeType.ALL, orphanRemoval = true)
    private PfeJury jury;

    @OneToMany(mappedBy = "pfeProjet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PfeEvaluation> evaluations = new ArrayList<>();
}
