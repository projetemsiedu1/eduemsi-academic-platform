package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.emsi.academic.domain.entity.Campus;
import ma.emsi.academic.domain.entity.Utilisateur;
import ma.emsi.academic.domain.enums.RoleEnum;
import ma.emsi.academic.dto.auth.ChangePasswordRequest;
import ma.emsi.academic.dto.auth.LoginRequest;
import ma.emsi.academic.dto.auth.LoginResponse;
import ma.emsi.academic.dto.auth.RegisterRequest;
import ma.emsi.academic.dto.auth.UserSummaryDto;
import ma.emsi.academic.exception.BusinessRuleException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.CampusRepository;
import ma.emsi.academic.repository.UtilisateurRepository;
import ma.emsi.academic.security.CustomUserDetails;
import ma.emsi.academic.security.JwtProperties;
import ma.emsi.academic.security.JwtTokenProvider;
import ma.emsi.academic.service.AuthService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.core.env.Environment environment;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;
    private final UtilisateurRepository utilisateurRepository;
    private final CampusRepository campusRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Tentative de connexion pour l'identifiant : {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Mettre à jour l'horodatage de dernière connexion
        utilisateurRepository.findByUsername(userDetails.getUsername()).ifPresent(u -> {
            u.setLastLoginAt(LocalDateTime.now());
            utilisateurRepository.save(u);
        });

        String jwt = tokenProvider.generateToken(userDetails);

        return LoginResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpirationMs() / 1000)
                .userId(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .nom(userDetails.getNom())
                .prenom(userDetails.getPrenom())
                .role(userDetails.getRole())
                .campusId(userDetails.getCampusId())
                .campusNom(userDetails.getCampusNom())
                .build();
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Inscription d'un nouvel utilisateur : {}", request.getUsername());

        if (utilisateurRepository.existsByUsername(request.getUsername())) {
            throw new BusinessRuleException("Cet identifiant (" + request.getUsername() + ") est déjà utilisé.");
        }

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Cette adresse email (" + request.getEmail() + ") est déjà associée à un compte.");
        }

        Campus campus = null;
        if (request.getCampusId() != null) {
            campus = campusRepository.findById(request.getCampusId()).orElse(null);
        }
        if (campus == null) {
            campus = campusRepository.findAll().stream().findFirst().orElse(null);
        }

        // Public registration never grants administrative or planning privileges.
        RoleEnum userRole = RoleEnum.ROLE_ETUDIANT;

        Utilisateur newUser = Utilisateur.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .role(userRole)
                .campus(campus)
                .actif(true)
                .build();

        Utilisateur savedUser = utilisateurRepository.save(newUser);
        log.info("Nouvel utilisateur créé avec succès avec l'id : {}", savedUser.getId());

        // Connecter directement l'utilisateur inscrit et générer son JWT
        CustomUserDetails userDetails = CustomUserDetails.build(savedUser);
        String jwt = tokenProvider.generateToken(userDetails);

        return LoginResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpirationMs() / 1000)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .nom(savedUser.getNom())
                .prenom(savedUser.getPrenom())
                .role(savedUser.getRole().name())
                .campusId(campus != null ? campus.getId() : null)
                .campusNom(campus != null ? campus.getNom() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String username) {
        Utilisateur user = utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé : " + username));

        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .actif(user.getActif())
                .campusId(user.getCampus() != null ? user.getCampus().getId() : null)
                .campusNom(user.getCampus() != null ? user.getCampus().getNom() : null)
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessRuleException("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
        }

        Utilisateur user = utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé : " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("L'ancien mot de passe fourni est incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        utilisateurRepository.save(user);
        log.info("Mot de passe mis à jour avec succès pour l'utilisateur : {}", username);
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultUsersIfEmpty() {
        if (java.util.Arrays.stream(environment.getActiveProfiles()).noneMatch(p -> p.equals("local") || p.equals("dev") || p.equals("test"))) {
            return;
        }
        if (utilisateurRepository.count() > 0) {
            log.info("Des utilisateurs existent déjà dans la base de données. Pas de seeding nécessaire.");
            return;
        }

        log.info("Initialisation des comptes par défaut RBAC pour la plateforme académique EMSI...");
        Campus campusTarga = campusRepository.findAll().stream().findFirst().orElse(null);

        createSeedUser("admin", "Admin@2026!", "moad.moussaoui@emsi.ma", "Moussaoui", "Moad", RoleEnum.ROLE_SUPER_ADMIN, campusTarga);
        createSeedUser("resp_filiere", "Emsi@2026!", "nadia.berrada@emsi.ma", "Berrada", "Nadia", RoleEnum.ROLE_RESPONSABLE_FILIERE, campusTarga);
        createSeedUser("resp_planning", "Emsi@2026!", "mehdi.tazi@emsi.ma", "Tazi", "Mehdi", RoleEnum.ROLE_RESPONSABLE_PLANNING, campusTarga);
        createSeedUser("resp_pfe", "Emsi@2026!", "brahim.abod@emsi.ma", "Abod", "Brahim", RoleEnum.ROLE_RESPONSABLE_PFE, campusTarga);
        createSeedUser("resp_scolarite", "Emsi@2026!", "siham.bennani@emsi.ma", "Bennani", "Siham", RoleEnum.ROLE_RESPONSABLE_SCOLARITE, campusTarga);
        createSeedUser("prof_permanent", "Emsi@2026!", "amine.alami@emsi.ma", "Alami", "Amine", RoleEnum.ROLE_PROFESSEUR_PERMANENT, campusTarga);
        createSeedUser("prof_vacataire", "Emsi@2026!", "yassine.kadiri@emsi.ma", "Kadiri", "Yassine", RoleEnum.ROLE_PROFESSEUR_VACATAIRE, campusTarga);
        createSeedUser("etudiant", "Emsi@2026!", "anas.benjelloun@emsi.ma", "Benjelloun", "Anas", RoleEnum.ROLE_ETUDIANT, campusTarga);

        log.info("Seeding des 8 comptes RBAC terminé avec succès.");
    }

    private void createSeedUser(String username, String rawPassword, String email, String nom, String prenom, RoleEnum role, Campus campus) {
        Utilisateur user = Utilisateur.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .email(email)
                .nom(nom)
                .prenom(prenom)
                .role(role)
                .campus(campus)
                .actif(true)
                .build();
        utilisateurRepository.save(user);
    }
}
