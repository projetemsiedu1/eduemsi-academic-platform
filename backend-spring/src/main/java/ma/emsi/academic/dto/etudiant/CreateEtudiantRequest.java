package ma.emsi.academic.dto.etudiant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEtudiantRequest {

    @NotBlank(message = "Le matricule étudiant est obligatoire")
    @Size(max = 50, message = "Le matricule ne peut excéder 50 caractères")
    private String matricule;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut excéder 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut excéder 100 caractères")
    private String prenom;

    @NotBlank(message = "L'adresse email institutionnelle est obligatoire")
    @Email(message = "Format d'adresse email invalide")
    @Size(max = 150, message = "L'email ne peut excéder 150 caractères")
    private String email;

    @Size(max = 50, message = "Le téléphone ne peut excéder 50 caractères")
    private String telephone;

    @NotNull(message = "L'identifiant du groupe d'affectation est obligatoire")
    private Long groupeId;

    @Builder.Default
    private BigDecimal totalHeuresModuleSemestre = BigDecimal.valueOf(90.00);
}
