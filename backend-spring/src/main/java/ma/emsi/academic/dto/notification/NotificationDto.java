package ma.emsi.academic.dto.notification;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record NotificationDto(
        Long id,
        String titre,
        String message,
        String typeNotification,
        String destinataireUsername,
        String destinataireRole,
        Boolean lu,
        LocalDateTime dateEnvoi,
        String lienAction
) {}
