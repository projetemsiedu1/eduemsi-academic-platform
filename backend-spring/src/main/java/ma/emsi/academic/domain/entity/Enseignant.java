package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.TypeContrat;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "enseignants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"seances"})
@EqualsAndHashCode(callSuper = false, exclude = {"seances"})
public class Enseignant extends BaseEntity {

    @Column(name = "matricule", nullable = false, unique = true, length = 50)
    private String matricule;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "telephone", length = 50)
    private String telephone;

    @Column(name = "specialite", length = 150)
    private String specialite;

    /**
     * VACATAIRE (Priorité 1 absolue dans le solveur CP-SAT) vs PERMANENT (Quotas 18h)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type_contrat", nullable = false, length = 50)
    private TypeContrat typeContrat;

    @Column(name = "heures_contractuelles_semaine", nullable = false)
    @Builder.Default
    private Integer heuresContractuellesSemaine = 18;

    @Column(name = "disponibilites_fixes_json", columnDefinition = "TEXT")
    private String disponibilitesFixesJson;

    @Column(name = "est_actif", nullable = false)
    @Builder.Default
    private Boolean estActif = true;

    @OneToMany(mappedBy = "enseignant")
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
