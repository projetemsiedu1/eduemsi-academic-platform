package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.notification.CreateNotificationRequest;
import ma.emsi.academic.dto.notification.NotificationDto;
import ma.emsi.academic.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications Scolarité", description = "Envoi et consultation des notifications scolaires, convocations et alertes d'assiduité")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    @Operation(summary = "Lister les notifications de l'utilisateur connecté")
    public ResponseEntity<List<NotificationDto>> getMesNotifications(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "etudiant";
        String role = null;
        if (authentication != null && authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
            role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse(null);
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(username, role));
    }

    @PatchMapping("/{id}/lire")
    @Operation(summary = "Marquer une notification comme lue")
    public ResponseEntity<NotificationDto> marquerCommeLu(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.marquerCommeLu(id));
    }

    @PostMapping("/envoyer")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_SCOLARITE','RESPONSABLE_PLANNING')")
    @Operation(summary = "Émettre une notification de scolarité à un étudiant, un groupe ou un rôle")
    public ResponseEntity<NotificationDto> envoyerNotification(@Valid @RequestBody CreateNotificationRequest request) {
        return new ResponseEntity<>(notificationService.envoyerNotification(request), HttpStatus.CREATED);
    }
}
