package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;
import ma.emsi.academic.domain.enums.TypeSalle;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "elements_module")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"module", "seances"})
@EqualsAndHashCode(callSuper = false, exclude = {"module", "seances"})
public class ElementModule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "code_element", nullable = false, unique = true, length = 50)
    private String codeElement;

    @Column(name = "intitule", nullable = false, length = 150)
    private String intitule;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_salle_requis", nullable = false, length = 50)
    @Builder.Default
    private TypeSalle typeSalleRequis = TypeSalle.STANDARD;

    @Column(name = "volume_horaire", nullable = false)
    @Builder.Default
    private Integer volumeHoraire = 45;

    @OneToMany(mappedBy = "elementModule")
    @Builder.Default
    private List<Seance> seances = new ArrayList<>();
}
