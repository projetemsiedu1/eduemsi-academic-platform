package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.TypeSalle;

@Entity
@Table(name = "salles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"campus"})
@EqualsAndHashCode(callSuper = false, exclude = {"campus"})
public class Salle extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campus_id", nullable = false)
    private Campus campus;

    @Column(name = "code_salle", nullable = false, unique = true, length = 50)
    private String codeSalle;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_salle", nullable = false, length = 50)
    private TypeSalle typeSalle;

    @Column(name = "capacite", nullable = false)
    private Integer capacite;

    @Column(name = "nombre_pc_operationnels", nullable = false)
    @Builder.Default
    private Integer nombrePcOperationnels = 0;

    @Column(name = "specs_equipements", columnDefinition = "TEXT")
    private String specsEquipements;

    @Column(name = "horaires_ouverture", length = 100)
    @Builder.Default
    private String horairesOuverture = "Séances S1 à S6 (08h30 - 18h45)";

    @Column(name = "est_disponible", nullable = false)
    @Builder.Default
    private Boolean estDisponible = true;
}
