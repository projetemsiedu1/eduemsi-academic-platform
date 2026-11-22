package ma.emsi.academic.dto.pfe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.academic.domain.enums.OriginePfe;
import ma.emsi.academic.domain.enums.StatutPfe;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PfeProjectDto {
    private Long id;
    private Long filiereId;
    private String filiereCode;
    private String filiereLibelle;
    private String titre;
    private String resume;
    private String technologiesCles;
    private String binomeEtudiants;
    private StatutPfe statut;
    private OriginePfe origine;
    private String entrepriseAccueil;
    private Long sujetCatalogueId;
    private Long etudiant1Id;
    private String etudiant1Nom;
    private Long etudiant2Id;
    private String etudiant2Nom;
    private Long encadrantSouhaiteId;
    private String encadrantSouhaiteNom;
    private String commentaireValidation;
    private BigDecimal noteFinale;
    private String mention;
    private Boolean pvVerrouille;
    private LocalDateTime dateVerrouillage;
    private Integer nbEvaluations;
    private String monRoleJury;
    private BigDecimal maNoteSaisie;

    // Soutenance & Jury associés (si planifiés)
    private Long juryId;
    private Long encadrantId;
    private String encadrantNom;
    private Long rapporteurId;
    private String rapporteurNom;
    private Long presidentHdrId;
    private String presidentHdrNom;
    private Long examinateurIaId;
    private String examinateurIaNom;
    private Long salleSoutenanceId;
    private String salleSoutenanceCode;
    private LocalDateTime dateSoutenance;
    private BigDecimal scoreAffiniteIa;
    private String justificationIa;
}
