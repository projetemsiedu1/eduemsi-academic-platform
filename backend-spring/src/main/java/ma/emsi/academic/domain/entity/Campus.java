package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campus extends BaseEntity {

    @Column(name = "nom", nullable = false, unique = true, length = 100)
    private String nom;

    @Column(name = "adresse", nullable = false, length = 255)
    private String adresse;

    @Column(name = "ville", nullable = false, length = 100)
    @Builder.Default
    private String ville = "Marrakech";

    @OneToMany(mappedBy = "campus", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Salle> salles = new ArrayList<>();

    @OneToMany(mappedBy = "campusFixe")
    @Builder.Default
    private List<Groupe> groupesAssignes = new ArrayList<>();
}
