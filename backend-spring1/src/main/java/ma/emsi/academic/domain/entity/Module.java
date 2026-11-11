package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"filiere", "elements"})
@EqualsAndHashCode(callSuper = false, exclude = {"filiere", "elements"})
public class Module extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "filiere_id", nullable = false)
    private Filiere filiere;

    @Column(name = "code_module", nullable = false, unique = true, length = 50)
    private String codeModule;

    @Column(name = "intitule", nullable = false, length = 150)
    private String intitule;

    @Column(name = "semestre", nullable = false, length = 10)
    @Builder.Default
    private String semestre = "S1";

    @Column(name = "volume_horaire_total", nullable = false)
    @Builder.Default
    private Integer volumeHoraireTotal = 90;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ElementModule> elements = new ArrayList<>();
}
