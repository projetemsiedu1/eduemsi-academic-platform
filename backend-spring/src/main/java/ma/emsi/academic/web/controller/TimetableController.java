package ma.emsi.academic.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ma.emsi.academic.dto.pfe.MatchJuryRequest;
import ma.emsi.academic.dto.pfe.MatchJuryResponse;
import ma.emsi.academic.service.ai.GeminiAiServiceClient;
import ma.emsi.academic.service.ai.OpenRouterAiService;
import ma.emsi.academic.service.solver.OrToolsTimetableSolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/planning")

@Tag(name = "Planification & Emploi du Temps OR-Tools",
     description = "Solveur sous contraintes CP-SAT & Heuristique : Vacataire Priorité 1, 1 Groupe = 1 Campus Fixe, Salles LI_PC / LR_RESEAUX")
public class TimetableController {

    private final OrToolsTimetableSolver solver;
    private final OpenRouterAiService openRouterAiService;
    private final GeminiAiServiceClient geminiAiClient;

    public TimetableController(OrToolsTimetableSolver solver,
                               OpenRouterAiService openRouterAiService,
                               GeminiAiServiceClient geminiAiClient) {
        this.solver = solver;
        this.openRouterAiService = openRouterAiService;
        this.geminiAiClient = geminiAiClient;
    }

    @PostMapping({"/generer", "/generate"})
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING')")
    @Operation(summary = "Générer l'emploi du temps avec OR-Tools CP-SAT (3 règles dures EMSI)",
               description = "Résout l'emploi du temps en appliquant : R1 (Vacataire Priorité 1 absolue), R2 (1 groupe = 1 campus fixe), R3 (Type salle LI_PC/LR_RESEAUX)")
    public ResponseEntity<Map<String, Object>> genererEmploiDuTemps(@RequestBody(required = false) Map<String, Object> payload) {
        return executerResolution(payload);
    }

    @PostMapping("/solve")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING')")
    @Operation(summary = "Endpoint alternatif pour résoudre l'emploi du temps sous contraintes CP-SAT")
    public ResponseEntity<Map<String, Object>> resoudrePlanification(@RequestBody(required = false) Map<String, Object> payload) {
        return executerResolution(payload);
    }

    @GetMapping("/regles")
    @Operation(summary = "Documentation officielle des 3 contraintes dures du solveur EMSI")
    public ResponseEntity<Map<String, Object>> obtenirReglesPlanification() {
        return ResponseEntity.ok(Map.of(
            "regle1", Map.of(
                "nom", "Priorité 1 absolue aux Vacataires",
                "description", "Les vacataires ayant des créneaux rigides externes, leurs séances sont sanctuarisées en Passe 1 avant tout comblement par les enseignants permanents.",
                "statut", "DURE (Hard Constraint)"
            ),
            "regle2", Map.of(
                "nom", "Campus Unique et Fixe par Groupe",
                "description", "Un groupe d'étudiants étudie dans un campus fixe. Aucun déplacement inter-campus le même jour n'est autorisé.",
                "statut", "DURE (Hard Constraint)"
            ),
            "regle3", Map.of(
                "nom", "Typage Strict des Salles de Travaux Pratiques",
                "description", "LI_PC obligatoire pour TP Informatique/IA avec PC >= effectif. LR_RESEAUX obligatoire pour TP Réseaux (baies Cisco).",
                "statut", "DURE (Hard Constraint)"
            )
        ));
    }

    @SuppressWarnings("unchecked")
    private ResponseEntity<Map<String, Object>> executerResolution(Map<String, Object> payload) {
        List<Map<String, Object>> cours;
        List<Map<String, Object>> salles;
        List<Map<String, Object>> creneaux;

        if (payload != null && payload.containsKey("cours") && payload.get("cours") instanceof List) {
            cours = (List<Map<String, Object>>) payload.get("cours");
        } else {
            cours = initialiserCoursExemples();
        }

        if (payload != null && payload.containsKey("salles") && payload.get("salles") instanceof List) {
            salles = (List<Map<String, Object>>) payload.get("salles");
        } else {
            salles = initialiserSallesExemples();
        }

        if (payload != null && payload.containsKey("creneaux") && payload.get("creneaux") instanceof List) {
            creneaux = (List<Map<String, Object>>) payload.get("creneaux");
        } else {
            creneaux = initialiserCreneauxExemples();
        }

        Map<String, Object> resultat = solver.resoudrePlanification(cours, salles, creneaux);
        return ResponseEntity.ok(resultat);
    }

    private List<Map<String, Object>> initialiserCoursExemples() {
        return List.of(
            // COURS 1 : VACATAIRE avec créneau rigide (RÈGLE 1 & RÈGLE 3 : TP Info -> LI_PC)
            Map.of(
                "id", 101,
                "titreElement", "TP Cloud & Kubernetes",
                "necessiteSallePc", true,
                "typeSalleRequis", "LI_PC",
                "nomProf", "Dr. Alami Karim (Vacataire)",
                "statutEnseignant", "VACATAIRE",
                "creneauRigide", "C1", // RÈGLE 1 : Doit impérativement être le Lundi Matin 1
                "nomGroupe", "5A-IIR-G1",
                "effectif", 28,
                "campusDuJour", "Campus Guéliz" // RÈGLE 2 : Groupe fixé sur Guéliz
            ),
            // COURS 2 : TP Réseaux Cisco (RÈGLE 3 : LR_RESEAUX requis)
            Map.of(
                "id", 102,
                "titreElement", "TP Réseaux Cisco & Routage BGP",
                "necessiteSallePc", false,
                "typeSalleRequis", "LR_RESEAUX",
                "nomProf", "Pr. Berrada Omar (Vacataire)",
                "statutEnseignant", "VACATAIRE",
                "creneauRigide", "C2", // RÈGLE 1 : Créneau rigide Lundi Matin 2
                "nomGroupe", "5A-IIR-G1",
                "effectif", 28,
                "campusDuJour", "Campus Guéliz"
            ),
            // COURS 3 : Enseignant Permanent flexible sur Guéliz
            Map.of(
                "id", 103,
                "titreElement", "Architecture Microservices Java Spring Boot",
                "necessiteSallePc", false,
                "typeSalleRequis", "STANDARD",
                "nomProf", "Pr. Benassou Noussair (Permanent)",
                "statutEnseignant", "PERMANENT",
                "nomGroupe", "5A-IIR-G1",
                "effectif", 28,
                "campusDuJour", "Campus Guéliz"
            ),
            // COURS 4 : Enseignant Permanent sur Campus Targa (RÈGLE 2 : Groupe 5A-GI-G1 fixé sur Targa)
            Map.of(
                "id", 104,
                "titreElement", "TP Supervision SCADA & Robotique",
                "necessiteSallePc", true,
                "typeSalleRequis", "LI_PC",
                "nomProf", "Mme. Tazi Kenza (Permanent)",
                "statutEnseignant", "PERMANENT",
                "nomGroupe", "5A-GI-G1",
                "effectif", 24,
                "campusDuJour", "Campus Targa" // RÈGLE 2 : Campus Targa strict
            )
        );
    }

    private List<Map<String, Object>> initialiserSallesExemples() {
        return List.of(
            // Campus Guéliz
            Map.of("code", "G-Lab-PC-101", "type", "LI_PC", "typeSalle", "LI_PC", "capacite", 35, "nombrePc", 35, "campus", "Campus Guéliz"),
            Map.of("code", "G-Lab-Reseaux-1", "type", "LR_RESEAUX", "typeSalle", "LR_RESEAUX", "capacite", 30, "nombrePc", 15, "campus", "Campus Guéliz"),
            Map.of("code", "G-Amphi-A", "type", "AMPHI", "typeSalle", "AMPHI", "capacite", 120, "nombrePc", 0, "campus", "Campus Guéliz"),
            Map.of("code", "G-Salle-201", "type", "STANDARD", "typeSalle", "STANDARD", "capacite", 40, "nombrePc", 0, "campus", "Campus Guéliz"),

            // Campus Targa
            Map.of("code", "T-Lab-PC-01", "type", "LI_PC", "typeSalle", "LI_PC", "capacite", 30, "nombrePc", 30, "campus", "Campus Targa"),
            Map.of("code", "T-Salle-105", "type", "STANDARD", "typeSalle", "STANDARD", "capacite", 35, "nombrePc", 0, "campus", "Campus Targa")
        );
    }

    private List<Map<String, Object>> initialiserCreneauxExemples() {
        return List.of(
            Map.of("id", "C1", "jour", "Lundi", "libelle", "08:30 - 10:00 (Matin S1)"),
            Map.of("id", "C2", "jour", "Lundi", "libelle", "10:15 - 11:45 (Matin S2 - Pause 15m)"),
            Map.of("id", "C3", "jour", "Lundi", "libelle", "13:15 - 14:45 (Après-Midi S3 - Trou max 1h30)"),
            Map.of("id", "C4", "jour", "Lundi", "libelle", "15:00 - 16:30 (Après-Midi S4)")
        );
    }

    @PostMapping("/matching-pfe-ia")
    @Operation(summary = "Matching IA sémantique pour la composition du jury de soutenance PFE (OpenRouter AI)")
    public ResponseEntity<MatchJuryResponse> matcherJuryPfe(@RequestBody MatchJuryRequest request) {
        List<Map<String, String>> enseignants = List.of(
            Map.of("id", "1", "nom", "Pr. Benassou Noussair", "grade", "Docteur / HDR", "specialite", "Java / Spring Cloud / Microservices / DevOps", "statut", "PERMANENT"),
            Map.of("id", "2", "nom", "Pr. Ait Ounejjar Lahoussaine", "grade", "Professeur Habilité", "specialite", "Génie Logiciel / Systèmes Distribués / Kubernetes", "statut", "PERMANENT"),
            Map.of("id", "3", "nom", "Pr. Zgandri Mohammed", "grade", "Docteur d'État", "specialite", "Data Science / Gouvernance SI / IA Décisionnelle", "statut", "PERMANENT"),
            Map.of("id", "4", "nom", "Dr. Alami Karim", "grade", "Docteur", "specialite", "Deep Learning / Vision par Ordinateur / LLM", "statut", "VACATAIRE")
        );
        MatchJuryResponse resultat = openRouterAiService.matcherJuryPfe(request, enseignants);
        return ResponseEntity.ok(resultat);
    }

    @PostMapping("/analyse-cv-ia")
    @Operation(summary = "Analyse IA de CV d'enseignant candidat et détection d'adéquation avec les filières déficitaires")
    public ResponseEntity<Map<String, Object>> analyserCvCandidat(@RequestBody Map<String, String> request) {
        String cvTexte = request.getOrDefault("cvTexte", "Ingénieur Cloud senior certifié AWS et Kubernetes, 6 ans d'expérience en développement Java Spring Boot et Angular.");
        List<String> matieresDeficitaires = List.of("Java / Spring Cloud", "DevOps & Cloud");

        Map<String, Object> resultat = openRouterAiService.analyserCvCandidat(cvTexte, matieresDeficitaires);
        return ResponseEntity.ok(resultat);
    }
}
