package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.StatutPfe;

@Entity
@Table(name = "pfe_projets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"filiere", "jury"})
@EqualsAndHashCode(callSuper = false, exclude = {"filiere", "jury"})
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

    @OneToOne(mappedBy = "pfeProjet", cascade = CascadeType.ALL, orphanRemoval = true)
    private PfeJury jury;
}
