package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.emsi.academic.domain.entity.Notification;
import ma.emsi.academic.dto.notification.CreateNotificationRequest;
import ma.emsi.academic.dto.notification.NotificationDto;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.NotificationRepository;
import ma.emsi.academic.service.NotificationService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(String username, String role) {
        return notificationRepository.findForUser(username, role).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public NotificationDto envoyerNotification(CreateNotificationRequest request) {
        Notification notification = Notification.builder()
                .titre(request.titre())
                .message(request.message())
                .typeNotification(request.typeNotification() != null ? request.typeNotification() : "SCOLARITE")
                .destinataireUsername(request.destinataireUsername())
                .destinataireRole(request.destinataireRole())
                .lienAction(request.lienAction())
                .lu(false)
                .dateEnvoi(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }

    @Override
    @Transactional
    public NotificationDto marquerCommeLu(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable avec l'id : " + id));
        notification.setLu(true);
        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initialiserNotificationsDefaut() {
        if (notificationRepository.count() == 0) {
            log.info("Création des notifications initiales de scolarité...");

            notificationRepository.save(Notification.builder()
                    .titre("Rappel Assiduité & Règle des 20%")
                    .message("Rappel de la scolarité : Tout étudiant cumulant plus de 20% d'absences dans un module est automatiquement radié de la session d'examen.")
                    .typeNotification("ALERTE_ASSIDUITE")
                    .destinataireRole("ROLE_ETUDIANT")
                    .dateEnvoi(LocalDateTime.now().minusDays(3))
                    .lu(false)
                    .build());

            notificationRepository.save(Notification.builder()
                    .titre("Convocations aux Examens Disponibles")
                    .message("Les convocations officielles avec affectation des salles et numéros de table anti-triche sont consultables dans votre espace.")
                    .typeNotification("EXAMEN")
                    .destinataireRole("ROLE_ETUDIANT")
                    .dateEnvoi(LocalDateTime.now().minusDays(1))
                    .lienAction("/timetable/student")
                    .lu(false)
                    .build());

            notificationRepository.save(Notification.builder()
                    .titre("Changement de salle — Laboratoire Systèmes Distribués")
                    .message("Veuillez noter que le cours de Systèmes Distribués du Jeudi matin est transféré en Salle LI-102 (Campus Les Orangers).")
                    .typeNotification("CHANGEMENT_SALLE")
                    .destinataireRole("ROLE_ETUDIANT")
                    .dateEnvoi(LocalDateTime.now().minusHours(5))
                    .lu(false)
                    .build());

            notificationRepository.save(Notification.builder()
                    .titre("Planning de Surveillance d'Examens")
                    .message("Chers enseignants, vos affectations de surveillance pour la Session Normale sont publiées. Merci de valider votre planning.")
                    .typeNotification("EXAMEN")
                    .destinataireRole("ROLE_ENSEIGNANT")
                    .dateEnvoi(LocalDateTime.now().minusDays(2))
                    .lienAction("/timetable/teacher")
                    .lu(false)
                    .build());
        }
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .titre(n.getTitre())
                .message(n.getMessage())
                .typeNotification(n.getTypeNotification())
                .destinataireUsername(n.getDestinataireUsername())
                .destinataireRole(n.getDestinataireRole())
                .lu(n.getLu())
                .dateEnvoi(n.getDateEnvoi())
                .lienAction(n.getLienAction())
                .build();
    }
}
