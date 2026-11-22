package ma.emsi.academic.dto.notification;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateNotificationRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String titre,

        @NotBlank(message = "Le message est obligatoire")
        String message,

        String typeNotification,
        String destinataireUsername,
        String destinataireRole,
        String lienAction
) {}
