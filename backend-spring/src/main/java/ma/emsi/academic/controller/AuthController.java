package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.auth.ChangePasswordRequest;
import ma.emsi.academic.dto.auth.LoginRequest;
import ma.emsi.academic.dto.auth.LoginResponse;
import ma.emsi.academic.dto.auth.UserSummaryDto;
import ma.emsi.academic.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification & Sécurité RBAC", description = "Gestion des sessions JWT, contrôle d'accès par rôle et gestion de compte")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authentification utilisateur et génération du token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel acteur (étudiant, enseignant, administratif) et obtention du JWT")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody ma.emsi.academic.dto.auth.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obtenir les informations du profil connecté")
    public ResponseEntity<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mise à jour sécurisée du mot de passe de l'utilisateur")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }

    @PostMapping("/seed-users")
    @Operation(summary = "Réinitialiser / insérer les comptes de démonstration par défaut (Dev/Admin)")
    public ResponseEntity<Map<String, String>> seedUsers() {
        authService.seedDefaultUsersIfEmpty();
        return ResponseEntity.ok(Map.of("message", "Comptes RBAC vérifiés/initialisés avec succès."));
    }
}
