package ma.emsi.academic.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {

    /**
     * Clé secrète HMAC-SHA256 minimale de 256 bits (32 caractères ou base64)
     */
    private String secret = "EMSI_UNIVORA_ACADEMIC_SECURITY_SUPER_SECRET_KEY_2026_HMAC_SHA256_SECURED";

    /**
     * Durée de validité du token d'accès en millisecondes (24 heures)
     */
    private long expirationMs = 86_400_000L;

    /**
     * Durée de validité du refresh token en millisecondes (7 jours)
     */
    private long refreshExpirationMs = 604_800_000L;
}
