package ma.emsi.academic.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String username;
    private String email;
    private String nom;
    private String prenom;
    private String role;
    private Boolean actif;
    private Long campusId;
    private String campusNom;
    private LocalDateTime lastLoginAt;
}
