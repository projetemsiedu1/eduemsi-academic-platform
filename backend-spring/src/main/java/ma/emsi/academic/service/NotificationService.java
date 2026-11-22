package ma.emsi.academic.service;

import ma.emsi.academic.dto.notification.CreateNotificationRequest;
import ma.emsi.academic.dto.notification.NotificationDto;

import java.util.List;

public interface NotificationService {
    List<NotificationDto> getNotificationsForUser(String username, String role);
    NotificationDto envoyerNotification(CreateNotificationRequest request);
    NotificationDto marquerCommeLu(Long id);
    void initialiserNotificationsDefaut();
}
