package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.StatutAbsence;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "absences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"etudiant", "seance"})
@EqualsAndHashCode(callSuper = false, exclude = {"etudiant", "seance"})
public class Absence extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seance_id", nullable = false)
    private Seance seance;

    @Column(name = "date_seance", nullable = false)
    private LocalDate dateSeance;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 30)
    @Builder.Default
    private StatutAbsence statut = StatutAbsence.ABSENT_NON_JUSTIFIE;

    @Column(name = "heures_absence", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal heuresAbsence = BigDecimal.valueOf(1.50);

    @Column(name = "motif_justification", columnDefinition = "TEXT")
    private String motifJustification;

    @Column(name = "date_justification")
    private LocalDate dateJustification;

    @Column(name = "valide_par_scolarite", nullable = false)
    @Builder.Default
    private Boolean valideParScolarite = false;
}
