package ma.emsi.academic.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.enums.StatutPfe;
import ma.emsi.academic.dto.pfe.*;
import ma.emsi.academic.service.PfeService;
import ma.emsi.academic.service.ai.OpenRouterAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pfe")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Gestion PFE & Intelligence Artificielle OpenRouter",
     description = "Workflow complet PFE MySQL, Catalogue sujets, Matching IA 4 membres, Grille d'évaluation EMSI /20 & PV")
public class PfeAiController {

    private final OpenRouterAiService openRouterAiService;
    private final PfeService pfeService;

    private static final List<Map<String, String>> ENSEIGNANTS_FALLBACK = List.of(
        Map.of("id", "1", "nom", "Pr. Alami Karim", "grade", "Docteur", "specialite", "Cloud, Deep Learning & DevOps", "departement", "IIR", "statut", "VACATAIRE"),
        Map.of("id", "2", "nom", "Pr. Benassou Noussair", "grade", "Professeur Habilité (HDR)", "specialite", "Java, Spring Boot, Microservices", "departement", "IIR", "statut", "PERMANENT"),
        Map.of("id", "3", "nom", "Pr. Tazi Kenza", "grade", "Professeur Habilité (HDR)", "specialite", "Recherche Opérationnelle & ERP", "departement", "GI", "statut", "PERMANENT"),
        Map.of("id", "4", "nom", "Pr. Abod Brahim", "grade", "Professeur Habilité (HDR)", "specialite", "Architecture Réseaux & PFE", "departement", "IIR", "statut", "PERMANENT")
    );

    // ================= CONSULTATION & CRUD PROJETS PFE (PERSISTANTS) =================

    @GetMapping
    @Operation(summary = "Lister tous les projets PFE avec filtre optionnel par statut")
    public ResponseEntity<List<PfeProjectDto>> listerTousLesPfe(
            @RequestParam(required = false) StatutPfe statut) {
        return ResponseEntity.ok(pfeService.listProjets(statut));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ETUDIANT','SUPER_ADMIN')")
    @Operation(summary = "Consulter le projet PFE actif (ou dernier rejeté) de l'étudiant connecté")
    public ResponseEntity<PfeProjectDto> getMonPfe(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "etudiant";
        PfeProjectDto dto = pfeService.getMonPfe(username);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/me")
    @PreAuthorize("hasAnyRole('ETUDIANT','SUPER_ADMIN')")
    @Operation(summary = "Soumettre un sujet de stage PFE (monôme ou binôme du même groupe)")
    public ResponseEntity<PfeProjectDto> soumettreSujetStage(
            Authentication authentication,
            @Valid @RequestBody SoumettreSujetStageRequest request) {
        String username = authentication != null ? authentication.getName() : "etudiant";
        return new ResponseEntity<>(pfeService.soumettreSujetStage(username, request), HttpStatus.CREATED);
    }

    // ================= CATALOGUE DES SUJETS PFE =================

    @GetMapping("/sujets")
    @Operation(summary = "Lister les sujets PFE du catalogue (filtrés par filière et disponibilité pour les étudiants)")
    public ResponseEntity<List<SujetCatalogueDto>> getSujetsCatalogue(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "";
        String role = extractRole(authentication);
        return ResponseEntity.ok(pfeService.getSujetsCatalogue(username, role));
    }

    @GetMapping("/sujets/mes-sujets")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Lister les sujets PFE proposés par l'enseignant connecté")
    public ResponseEntity<List<SujetCatalogueDto>> getMesSujets(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        return ResponseEntity.ok(pfeService.getMesSujets(username));
    }

    @PostMapping("/sujets")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Proposer un nouveau sujet PFE dans le catalogue")
    public ResponseEntity<SujetCatalogueDto> createSujet(
            Authentication authentication,
            @Valid @RequestBody CreateSujetCatalogueRequest request) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        return new ResponseEntity<>(pfeService.createSujetCatalogue(username, request), HttpStatus.CREATED);
    }

    @PutMapping("/sujets/{id}")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Modifier un sujet du catalogue")
    public ResponseEntity<SujetCatalogueDto> updateSujet(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CreateSujetCatalogueRequest request) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        boolean isPrivileged = hasRole(authentication, "ROLE_SUPER_ADMIN", "ROLE_RESPONSABLE_PFE");
        return ResponseEntity.ok(pfeService.updateSujetCatalogue(username, isPrivileged, id, request));
    }

    @DeleteMapping("/sujets/{id}")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Supprimer un sujet du catalogue")
    public ResponseEntity<Void> deleteSujet(Authentication authentication, @PathVariable Long id) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        boolean isPrivileged = hasRole(authentication, "ROLE_SUPER_ADMIN", "ROLE_RESPONSABLE_PFE");
        pfeService.deleteSujetCatalogue(username, isPrivileged, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sujets/{id}/choisir")
    @PreAuthorize("hasAnyRole('ETUDIANT','SUPER_ADMIN')")
    @Operation(summary = "Choisir un sujet du catalogue (avec binôme optionnel du même groupe)")
    public ResponseEntity<PfeProjectDto> choisirSujet(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody(required = false) ChoisirSujetRequest request) {
        String username = authentication != null ? authentication.getName() : "etudiant";
        return new ResponseEntity<>(pfeService.choisirSujetCatalogue(username, id, request), HttpStatus.CREATED);
    }

    // ================= JURYS ENSEIGNANT CONNECTÉ =================

    @GetMapping("/jurys/me")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Lister les soutenances où l'enseignant connecté est membre du jury")
    public ResponseEntity<List<PfeProjectDto>> getMesJurys(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        return ResponseEntity.ok(pfeService.getMesJurys(username));
    }

    // ================= GESTION PROJET BY ID & WORKFLOW =================

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le détail complet d'un projet PFE")
    public ResponseEntity<PfeProjectDto> getPfeById(@PathVariable Long id) {
        return ResponseEntity.ok(pfeService.getProjet(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PFE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Mettre à jour un projet PFE")
    public ResponseEntity<PfeProjectDto> modifierPfe(
            @PathVariable Long id,
            @Valid @RequestBody CreatePfeProjectRequest request) {
        return ResponseEntity.ok(pfeService.updateProjet(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PFE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Supprimer un projet PFE")
    public ResponseEntity<Void> supprimerPfe(@PathVariable Long id) {
        pfeService.deleteProjet(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/valider-sujet")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PFE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Valider ou rejeter un sujet PFE soumis (SOUMIS -> EN_ATTENTE_JURY | REJETE)")
    public ResponseEntity<PfeProjectDto> validerSujet(
            @PathVariable Long id,
            @Valid @RequestBody ValiderSujetRequest request) {
        return ResponseEntity.ok(pfeService.validerSujet(id, request));
    }

    @PostMapping("/{id}/proposer-jury")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PFE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Proposer une composition de jury à 4 membres via l'IA OpenRouter (sans persister)")
    public ResponseEntity<MatchJuryResponse> proposerJury(@PathVariable Long id) {
        return ResponseEntity.ok(pfeService.proposerJury(id));
    }

    @PostMapping("/{id}/jury")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PFE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Affecter officiellement le jury, la salle et la date de soutenance avec notifications")
    public ResponseEntity<PfeProjectDto> planifierJury(
            @PathVariable Long id,
            @Valid @RequestBody PlanifierSoutenanceRequest request) {
        return ResponseEntity.ok(pfeService.planifierJury(id, request));
    }

    // ================= GRILLE D'ÉVALUATION /20 & PV DE SOUTENANCE =================

    @GetMapping("/{id}/evaluations")
    @Operation(summary = "Consulter les évaluations saisies par les membres du jury")
    public ResponseEntity<List<EvaluationPfeDto>> getEvaluations(@PathVariable Long id) {
        return ResponseEntity.ok(pfeService.getEvaluations(id));
    }

    @PutMapping("/{id}/evaluations/me")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Saisir ou modifier sa grille d'évaluation EMSI (/20) en tant que membre du jury")
    public ResponseEntity<EvaluationPfeDto> evaluerMoi(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody EvaluationPfeRequest request) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        return ResponseEntity.ok(pfeService.enregistrerEvaluationMoi(id, username, request));
    }

    @PutMapping("/{id}/evaluations/{enseignantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Saisir ou mettre à jour la grille d'évaluation pour un membre désigné du jury")
    public ResponseEntity<EvaluationPfeDto> evaluerParMembre(
            @PathVariable Long id,
            @PathVariable Long enseignantId,
            @Valid @RequestBody EvaluationPfeRequest request) {
        return ResponseEntity.ok(pfeService.enregistrerEvaluationPourEnseignant(id, enseignantId, request));
    }

    @PostMapping("/{id}/pv/verrouiller")
    @PreAuthorize("hasAnyRole('PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE','SUPER_ADMIN','RESPONSABLE_PFE')")
    @Operation(summary = "Calculer la note finale, attribuer la mention marocaine et verrouiller le PV (Président HDR)")
    public ResponseEntity<PvSoutenanceDto> verrouillerPv(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication != null ? authentication.getName() : "prof_permanent";
        boolean isSuperAdmin = hasRole(authentication, "ROLE_SUPER_ADMIN");
        return ResponseEntity.ok(pfeService.verrouillerPv(id, username, isSuperAdmin));
    }

    @GetMapping("/{id}/pv")
    @Operation(summary = "Consulter le Procès-Verbal de soutenance PFE")
    public ResponseEntity<PvSoutenanceDto> getPv(@PathVariable Long id) {
        return ResponseEntity.ok(pfeService.getPv(id));
    }

    // ================= OUTILS IA STATELESS & RH (CONSERVÉS) =================

    @PostMapping("/match-jury")
    @Operation(summary = "Matching IA OpenRouter d'un Jury PFE à 4 membres (stateless)")
    public ResponseEntity<MatchJuryResponse> matchJuryQuatreMembres(@RequestBody MatchJuryRequest request) {
        return ResponseEntity.ok(openRouterAiService.matcherJuryPfe(request, ENSEIGNANTS_FALLBACK));
    }

    @PostMapping("/match-jury-direct")
    @Operation(summary = "Matching IA instantané direct à partir de texte libre")
    public ResponseEntity<MatchJuryResponse> matcherJuryDirect(@RequestBody MatchJuryRequest request) {
        return ResponseEntity.ok(openRouterAiService.matcherJuryPfe(request, ENSEIGNANTS_FALLBACK));
    }

    @GetMapping("/enseignants")
    @Operation(summary = "Lister un extrait d'enseignants de référence PFE")
    public ResponseEntity<List<Map<String, String>>> listerEnseignants() {
        return ResponseEntity.ok(ENSEIGNANTS_FALLBACK);
    }

    @GetMapping("/rh/deficits")
    @Operation(summary = "Lister les déficits d'enseignants détectés par filière")
    public ResponseEntity<List<Map<String, Object>>> listerDeficitsRh() {
        List<Map<String, Object>> deficits = List.of(
            Map.of("filiere", "5A-IIR (Informatique)", "matiere", "Architectures Cloud & Microservices", "heuresManquantes", 120, "urgence", "CRITIQUE", "campus", "Guéliz"),
            Map.of("filiere", "5A-IIR (IA & Big Data)", "matiere", "LLMOps & Vision Artificielle", "heuresManquantes", 90, "urgence", "MOYENNE", "campus", "Guéliz"),
            Map.of("filiere", "5A-GI (Génie Industriel)", "matiere", "Supervision SCADA & FAO Robotique", "heuresManquantes", 60, "urgence", "MODÉRÉE", "campus", "Targa"),
            Map.of("filiere", "4A-IFA (Automatisme)", "matiere", "Cybersécurité Industrielle IEC 62443", "heuresManquantes", 45, "urgence", "FAIBLE", "campus", "Centre")
        );
        return ResponseEntity.ok(deficits);
    }

    @PostMapping("/rh/analyse-cv")
    @Operation(summary = "Analyser un CV candidat et calculer l'adéquation IA avec les filières déficitaires")
    public ResponseEntity<Map<String, Object>> analyserCv(@RequestBody Map<String, String> payload) {
        String cvTexte = payload.getOrDefault("cvTexte", "");
        List<String> matieres = List.of("Java / Spring Cloud", "DevOps & Cloud", "Intelligence Artificielle / Data", "Génie Industriel & Robotique");
        return ResponseEntity.ok(openRouterAiService.analyserCvCandidat(cvTexte, matieres));
    }

    private String extractRole(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) return null;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);
    }

    private boolean hasRole(Authentication authentication, String... roles) {
        if (authentication == null || authentication.getAuthorities() == null) return false;
        for (GrantedAuthority auth : authentication.getAuthorities()) {
            for (String r : roles) {
                if (r.equals(auth.getAuthority())) return true;
            }
        }
        return false;
    }
}
