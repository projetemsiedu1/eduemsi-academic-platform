package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groupes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"filiere", "campusFixe", "etudiants", "seances"})
@EqualsAndHashCode(callSuper = false, exclude = {"filiere", "campusFixe", "etudiants", "seances"})
public class Groupe extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "filiere_id", nullable = false)
    private Filiere filiere;

    /**
     * Règle absolue EMSI : Un groupe étudie dans un seul et unique campus assigné.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campus_fixe_id", nullable = false)
    private Campus campusFixe;

    @Column(name = "code_groupe", nullable = false, unique = true, length = 50)
    private String codeGroupe;

    @Column(name = "annee_etude", nullable = false)
    private Integer anneeEtude;

    @Column(name = "option_specialite", length = 150)
    private String optionSpecialite;

    @Column(name = "effectif", nullable = false)
    private Integer effectif;

    @Column(name = "delegue_nom", length = 150)
    private String delegueNom;

    @Column(name = "laboratoires_requis", length = 100)
    @Builder.Default
    private String laboratoiresRequis = "LI_PC";

    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Etudiant> etudiants = new ArrayList<>();

    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
