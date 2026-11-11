package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "filieres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"groupes", "modules"})
@EqualsAndHashCode(callSuper = false, exclude = {"groupes", "modules"})
public class Filiere extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "libelle", nullable = false, length = 150)
    private String libelle;

    @OneToMany(mappedBy = "filiere", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Groupe> groupes = new ArrayList<>();

    @OneToMany(mappedBy = "filiere", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Module> modules = new ArrayList<>();
}
