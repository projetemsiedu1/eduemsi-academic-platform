package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

@Entity
@Table(name = "pfe_sujets_catalogue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"enseignant", "filiere"})
@EqualsAndHashCode(callSuper = false, exclude = {"enseignant", "filiere"})
public class PfeSujetCatalogue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private Enseignant enseignant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "filiere_id", nullable = false)
    private Filiere filiere;

    @Column(name = "titre", nullable = false, length = 255)
    private String titre;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "technologies", length = 255)
    private String technologies;

    @Column(name = "places_max", nullable = false)
    @Builder.Default
    private Integer placesMax = 1;

    @Column(name = "est_disponible", nullable = false)
    @Builder.Default
    private Boolean estDisponible = true;
}
