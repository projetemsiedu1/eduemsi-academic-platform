package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "etudiants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"groupe", "absences"})
@EqualsAndHashCode(callSuper = false, exclude = {"groupe", "absences"})
public class Etudiant extends BaseEntity {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "groupe_id", nullable = false)
    private Groupe groupe;

    @Column(name = "total_heures_module_semestre", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalHeuresModuleSemestre = BigDecimal.valueOf(90.00);

    @Column(name = "cumul_heures_absence", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal cumulHeuresAbsence = BigDecimal.ZERO;

    /**
     * Règle absolue EMSI des 20% : Si cumulHeuresAbsence > 18.00h (sur un module de 90h),
     * l'étudiant est radié d'office des examens finaux.
     */
    @Column(name = "est_radie_examen", nullable = false)
    @Builder.Default
    private Boolean estRadieExamen = false;

    @OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Absence> absences = new ArrayList<>();
}
