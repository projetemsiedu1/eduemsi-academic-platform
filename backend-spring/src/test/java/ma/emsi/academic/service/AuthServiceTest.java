package ma.emsi.academic.service;

import ma.emsi.academic.domain.entity.Campus;
import ma.emsi.academic.domain.entity.Utilisateur;
import ma.emsi.academic.domain.enums.RoleEnum;
import ma.emsi.academic.dto.auth.ChangePasswordRequest;
import ma.emsi.academic.dto.auth.LoginRequest;
import ma.emsi.academic.dto.auth.LoginResponse;
import ma.emsi.academic.exception.BusinessRuleException;
import ma.emsi.academic.repository.CampusRepository;
import ma.emsi.academic.repository.UtilisateurRepository;
import ma.emsi.academic.security.CustomUserDetails;
import ma.emsi.academic.security.JwtProperties;
import ma.emsi.academic.security.JwtTokenProvider;
import ma.emsi.academic.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private CampusRepository campusRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private Utilisateur user;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        Campus campus = Campus.builder().nom("Campus Targa").build();
        user = Utilisateur.builder()
                .username("resp_planning")
                .passwordHash("hashed_secret")
                .email("planning@emsi.ma")
                .nom("Tazi")
                .prenom("Mehdi")
                .role(RoleEnum.ROLE_RESPONSABLE_PLANNING)
                .campus(campus)
                .actif(true)
                .build();

        userDetails = CustomUserDetails.build(user);
    }

    @Test
    @DisplayName("Inscription réussie d'un nouvel utilisateur")
    void testRegister_Success() {
        ma.emsi.academic.dto.auth.RegisterRequest request = ma.emsi.academic.dto.auth.RegisterRequest.builder()
                .username("new_student")
                .password("Pass@2026!")
                .email("new.student@emsi.ma")
                .nom("El Mansouri")
                .prenom("Karim")
                .role(RoleEnum.ROLE_ETUDIANT)
                .build();

        when(utilisateurRepository.existsByUsername("new_student")).thenReturn(false);
        when(utilisateurRepository.existsByEmail("new.student@emsi.ma")).thenReturn(false);
        when(passwordEncoder.encode("Pass@2026!")).thenReturn("hashed_pass");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(invocation -> {
            Utilisateur u = invocation.getArgument(0);
            u.setId(99L);
            return u;
        });
        when(jwtProperties.getExpirationMs()).thenReturn(86400000L);
        when(tokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("jwt.token.registered");

        LoginResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt.token.registered", response.getAccessToken());
        assertEquals("new_student", response.getUsername());
        assertEquals("ROLE_ETUDIANT", response.getRole());
    }

    @Test
    @DisplayName("Authentification réussie retourne le token JWT et les informations de profil")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("resp_planning", "Emsi@2026!");
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(utilisateurRepository.findByUsername("resp_planning")).thenReturn(Optional.of(user));
        when(jwtProperties.getExpirationMs()).thenReturn(86400000L);
        when(tokenProvider.generateToken(userDetails)).thenReturn("jwt.token.valid");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.valid", response.getAccessToken());
        assertEquals("resp_planning", response.getUsername());
        assertEquals("ROLE_RESPONSABLE_PLANNING", response.getRole());
        verify(utilisateurRepository).save(user);
    }

    @Test
    @DisplayName("Échec de connexion avec mot de passe erroné lève BadCredentialsException")
    void testLogin_BadCredentials() {
        LoginRequest request = new LoginRequest("resp_planning", "WrongPassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Changement de mot de passe réussi")
    void testChangePassword_Success() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPass@123")
                .newPassword("NewPass@456")
                .confirmPassword("NewPass@456")
                .build();

        when(utilisateurRepository.findByUsername("resp_planning")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPass@123", "hashed_secret")).thenReturn(true);
        when(passwordEncoder.encode("NewPass@456")).thenReturn("new_hashed_secret");

        authService.changePassword("resp_planning", request);

        assertEquals("new_hashed_secret", user.getPasswordHash());
        verify(utilisateurRepository).save(user);
    }

    @Test
    @DisplayName("Changement de mot de passe échoue si confirmation non concordante")
    void testChangePassword_MismatchConfirmation() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPass@123")
                .newPassword("NewPass@456")
                .confirmPassword("DifferentPass@789")
                .build();

        assertThrows(BusinessRuleException.class, () -> authService.changePassword("resp_planning", request));
    }
}
