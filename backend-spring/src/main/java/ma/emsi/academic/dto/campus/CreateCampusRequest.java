package ma.emsi.academic.dto.campus;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampusRequest {
    @NotBlank(message = "Le nom du campus est obligatoire")
    private String nom;

    @NotBlank(message = "L'adresse du campus est obligatoire")
    private String adresse;

    @Builder.Default
    private String ville = "Marrakech";
}
