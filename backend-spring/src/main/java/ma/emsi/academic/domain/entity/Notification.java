package ma.emsi.academic.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.emsi.academic.domain.common.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_dest_user", columnList = "destinataire_username"),
        @Index(name = "idx_notif_dest_role", columnList = "destinataire_role"),
        @Index(name = "idx_notif_date", columnList = "date_envoi")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Column(name = "titre", nullable = false, length = 150)
    private String titre;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "type_notification", nullable = false, length = 50)
    private String typeNotification; // SCOLARITE, CHANGEMENT_SALLE, EXAMEN, ALERTE_ASSIDUITE, URGENT

    @Column(name = "destinataire_username", length = 100)
    private String destinataireUsername;

    @Column(name = "destinataire_role", length = 50)
    private String destinataireRole; // ROLE_ETUDIANT, ROLE_ENSEIGNANT, ou null pour tous

    @Column(name = "lu", nullable = false)
    @Builder.Default
    private Boolean lu = false;

    @Column(name = "date_envoi", nullable = false)
    @Builder.Default
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @Column(name = "lien_action", length = 255)
    private String lienAction;
}
