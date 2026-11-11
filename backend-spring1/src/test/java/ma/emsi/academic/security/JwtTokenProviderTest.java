package ma.emsi.academic.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecret("EMSI_ACADEMIC_TEST_SECRET_KEY_FOR_UNIT_TESTS_AT_LEAST_32_BYTES_LONG_2026");
        jwtProperties.setExpirationMs(3600000L); // 1h
        jwtTokenProvider = new JwtTokenProvider(jwtProperties);
    }

    @Test
    @DisplayName("Génération et validation d'un jeton JWT valide avec extraction du username")
    void testGenerateAndValidateToken_Success() {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .id(1L)
                .username("admin")
                .email("admin@emsi.ma")
                .nom("Moussaoui")
                .prenom("Moad")
                .role("ROLE_SUPER_ADMIN")
                .campusId(1L)
                .campusNom("Campus Targa")
                .enabled(true)
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")))
                .build();

        String token = jwtTokenProvider.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("admin", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    @DisplayName("Validation d'un jeton JWT falsifié doit retourner false")
    void testValidateToken_TamperedToken_ReturnsFalse() {
        String forgedToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.InvalidSignatureHere123456789";

        assertFalse(jwtTokenProvider.validateToken(forgedToken));
    }
}
