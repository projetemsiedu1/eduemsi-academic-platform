package ma.emsi.academic.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long expiresIn;

    private Long userId;
    private String username;
    private String email;
    private String nom;
    private String prenom;
    private String role;
    private Long campusId;
    private String campusNom;
}
