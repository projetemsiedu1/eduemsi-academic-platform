package ma.emsi.academic.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ma.emsi.academic.dto.pfe.MatchJuryRequest;
import ma.emsi.academic.dto.pfe.MatchJuryResponse;
import ma.emsi.academic.service.ai.GeminiAiServiceClient;
import ma.emsi.academic.service.ai.OpenRouterAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/v1/pfe")

@Tag(name = "Gestion PFE & Intelligence Artificielle OpenRouter",
     description = "CRUD des PFE, Matching IA 4 membres (Encadrant, Rapporteur, Examinateur IA, Président HDR) via OpenRouter & Analyse RH")
public class PfeAiController {

    private final OpenRouterAiService openRouterAiService;
    private final GeminiAiServiceClient geminiAiClient;
    private final Map<Long, Map<String, Object>> pfeDatabase = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(100);

    // Liste officielle des enseignants EMSI éligibles aux jurys
    private final List<Map<String, String>> enseignantsDisponibles = List.of(
        Map.of("id", "1", "nom", "Pr. Benassou Noussair", "grade", "Docteur / HDR", "specialite", "Java / Spring Cloud / Microservices / DevOps", "departement", "IIR (Informatique)", "statut", "PERMANENT"),
        Map.of("id", "2", "nom", "Pr. Ait Ounejjar Lahoussaine", "grade", "Professeur Habilité", "specialite", "Génie Logiciel / Systèmes Distribués / Kubernetes", "departement", "IIR (Informatique)", "statut", "PERMANENT"),
        Map.of("id", "3", "nom", "Pr. Zgandri Mohammed", "grade", "Docteur d'État", "specialite", "Data Science / Gouvernance SI / IA Décisionnelle", "departement", "IIR / Big Data", "statut", "PERMANENT"),
        Map.of("id", "4", "nom", "Dr. Alami Karim", "grade", "Docteur", "specialite", "Deep Learning / Vision par Ordinateur / LLM", "departement", "IIR (Informatique)", "statut", "VACATAIRE"),
        Map.of("id", "5", "nom", "Mme. Tazi Kenza", "grade", "Ingénieur Chercheur", "specialite", "IoT / Automatisme Industriel / Cybersécurité", "departement", "IFA / Automatisme", "statut", "PERMANENT"),
        Map.of("id", "6", "nom", "M. Berrada Omar", "grade", "Expert Industriel", "specialite", "Cloud Architecture AWS / Azure / CI-CD", "departement", "IIR (Informatique)", "statut", "VACATAIRE")
    );

    public PfeAiController(OpenRouterAiService openRouterAiService, GeminiAiServiceClient geminiAiClient) {
        this.openRouterAiService = openRouterAiService;
        this.geminiAiClient = geminiAiClient;
        initialiserJeuxEssai();
    }

    private void initialiserJeuxEssai() {
        ajouterPfeInterne(
            "Plateforme Microservices & Orchestration Kubernetes",
            "Développement d'un ERP académique conteneurisé sous Kubernetes avec Spring Boot 3, Angular 18 et OR-Tools.",
            "Amine Bella",
            "5A-IIR (Ingénierie Informatique & Réseaux)",
            "Pr. Ait Ounejjar Lahoussaine",
            "Java, Spring Cloud, Docker, Kubernetes, Angular",
            "JURY_AFFECTE",
            "Pr. Benassou Noussair",
            "Dr. Alami Karim",
            "M. Berrada Omar",
            94.5,
            "Matching optimal validé par l'IA : Le rapporteur possède une affinité de 94.5% avec Spring Cloud et Docker. Encadrant non inclus dans le collège d'évaluation (BR-PFE-07 respectée)."
        );

        ajouterPfeInterne(
            "Détection d'Anomalies Vidéo par Vision Artificielle",
            "Système de surveillance temps réel basé sur YOLOv10 et PyTorch pour la détection d'intrusions sur sites sensibles.",
            "Ilyass Ait Ouahman",
            "5A-IIR (Option IA & Big Data)",
            "Pr. Zgandri Mohammed",
            "Python, PyTorch, YOLOv10, OpenCV, FastAPI",
            "EN_ATTENTE_JURY",
            null, null, null, null, null
        );

        ajouterPfeInterne(
            "Jumeau Numérique & Supervision SCADA Industrielle",
            "Conception d'un jumeau numérique 3D pour la maintenance prédictive d'une chaîne de montage robotisée EMSI.",
            "Ikram Mellakh",
            "5A-GI (Génie Industriel)",
            "Mme. Tazi Kenza",
            "Three.js, MQTT, Siemens TIA Portal, Python, Docker",
            "EN_ATTENTE_JURY",
            null, null, null, null, null
        );
    }

    private void ajouterPfeInterne(String titre, String problematique, String etudiant, String filiere,
                                  String encadrant, String technologies, String statut,
                                  String president, String rapporteur, String examinateur,
                                  Double score, String justification) {
        long id = idGenerator.incrementAndGet();
        Map<String, Object> pfe = new HashMap<>();
        pfe.put("id", id);
        pfe.put("titre", titre);
        pfe.put("sujet", titre);
        pfe.put("problematique", problematique);
        pfe.put("resume", problematique);
        pfe.put("etudiantNom", etudiant);
        pfe.put("filiere", filiere);
        pfe.put("encadrantNom", encadrant);
        pfe.put("technologies", technologies);
        pfe.put("statut", statut);
        pfe.put("presidentJury", president);
        pfe.put("rapporteurJury", rapporteur);
        pfe.put("examinateurJury", examinateur);
        pfe.put("scoreMatchingIa", score);
        pfe.put("justificationIa", justification);
        pfe.put("dateCreation", LocalDateTime.now().toString());
        pfeDatabase.put(id, pfe);
    }

    // =========================================================================
    // ENDPOINT REQUIS : POST /api/v1/pfe/match-jury (4 MEMBRES OPENROUTER IA)
    // =========================================================================

    @PostMapping("/match-jury")
    @Operation(summary = "Matching IA OpenRouter d'un Jury PFE à 4 membres (Encadrant, Rapporteur, Examinateur IA, Président HDR)",
               description = "Prend en entrée le sujet, le résumé, technologies, et retourne les 4 membres du jury avec score et justification éthique BR-PFE-07")
    public ResponseEntity<MatchJuryResponse> matchJuryQuatreMembres(@RequestBody MatchJuryRequest request) {
        MatchJuryResponse response = openRouterAiService.matcherJuryPfe(request, enseignantsDisponibles);
        return ResponseEntity.ok(response);
    }

    // ================= CRUD PFE =================

    @GetMapping
    @Operation(summary = "Lister tous les projets PFE")
    public ResponseEntity<List<Map<String, Object>>> listerTousLesPfe() {
        List<Map<String, Object>> liste = new ArrayList<>(pfeDatabase.values());
        liste.sort((a, b) -> Long.compare((Long) b.get("id"), (Long) a.get("id")));
        return ResponseEntity.ok(liste);
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau projet PFE")
    public ResponseEntity<Map<String, Object>> creerPfe(@RequestBody Map<String, Object> payload) {
        long id = idGenerator.incrementAndGet();
        Map<String, Object> nouveauPfe = new HashMap<>(payload);
        nouveauPfe.put("id", id);
        nouveauPfe.put("statut", "EN_ATTENTE_JURY");
        nouveauPfe.put("dateCreation", LocalDateTime.now().toString());
        pfeDatabase.put(id, nouveauPfe);
        return ResponseEntity.ok(nouveauPfe);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un projet PFE ou valider son jury")
    public ResponseEntity<Map<String, Object>> modifierPfe(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Map<String, Object> existant = pfeDatabase.get(id);
        if (existant == null) {
            return ResponseEntity.notFound().build();
        }
        existant.putAll(payload);
        existant.put("id", id);
        existant.put("dateMiseAJour", LocalDateTime.now().toString());
        return ResponseEntity.ok(existant);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un projet PFE")
    public ResponseEntity<Map<String, Object>> supprimerPfe(@PathVariable Long id) {
        Map<String, Object> supprime = pfeDatabase.remove(id);
        if (supprime == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "PFE supprimé avec succès", "id", id));
    }

    // ================= COMPATIBILITÉ ENDPOINTS PFE =================

    @PostMapping("/{id}/match-jury")
    @Operation(summary = "Lancer le matching IA sémantique pour affecter le jury de ce PFE existant")
    public ResponseEntity<Map<String, Object>> matcherJuryPourPfeExistant(@PathVariable Long id) {
        Map<String, Object> pfe = pfeDatabase.get(id);
        if (pfe == null) {
            return ResponseEntity.notFound().build();
        }

        String titre = (String) pfe.getOrDefault("titre", pfe.getOrDefault("sujet", ""));
        String problematique = (String) pfe.getOrDefault("problematique", pfe.getOrDefault("resume", ""));
        String technologies = (String) pfe.getOrDefault("technologies", "");
        String encadrant = (String) pfe.getOrDefault("encadrantNom", "");

        MatchJuryRequest req = MatchJuryRequest.builder()
                .sujet(titre)
                .resume(problematique)
                .technologies(technologies)
                .encadrant(encadrant)
                .build();

        MatchJuryResponse matchResp = openRouterAiService.matcherJuryPfe(req, enseignantsDisponibles);

        // Mettre à jour la base
        if (matchResp.getJury() != null) {
            if (matchResp.getJury().getEncadrant() != null) {
                pfe.put("encadrantNom", matchResp.getJury().getEncadrant().getNom());
            }
            if (matchResp.getJury().getPresidentHdr() != null) {
                pfe.put("presidentJury", matchResp.getJury().getPresidentHdr().getNom());
            }
            if (matchResp.getJury().getRapporteur() != null) {
                pfe.put("rapporteurJury", matchResp.getJury().getRapporteur().getNom());
            }
            if (matchResp.getJury().getExaminateurIa() != null) {
                pfe.put("examinateurJury", matchResp.getJury().getExaminateurIa().getNom());
            }
            pfe.put("jury4Membres", matchResp.getJury());
        }

        pfe.put("scoreMatchingIa", matchResp.getScoreMatching());
        pfe.put("justificationIa", matchResp.getJustification());
        pfe.put("modeExecutionIa", matchResp.getModeleUtilise());
        pfe.put("statut", "JURY_AFFECTE");
        pfe.put("dateMiseAJour", LocalDateTime.now().toString());

        Map<String, Object> reponse = new HashMap<>();
        reponse.put("pfe", pfe);
        reponse.put("jury", matchResp.getJury());
        reponse.put("scoreGlobalMatching", matchResp.getScoreMatching());
        reponse.put("justificationIa", matchResp.getJustification());
        reponse.put("modeExecution", matchResp.getModeleUtilise());
        reponse.put("regleEthiqueValidee", "Encadrant formellement disjoint du collège évaluateur (BR-PFE-07)");

        return ResponseEntity.ok(reponse);
    }

    @PostMapping("/match-jury-direct")
    @Operation(summary = "Matching IA instantané direct à partir de texte libre")
    public ResponseEntity<MatchJuryResponse> matcherJuryDirect(@RequestBody MatchJuryRequest request) {
        MatchJuryResponse res = openRouterAiService.matcherJuryPfe(request, enseignantsDisponibles);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/enseignants")
    @Operation(summary = "Lister les enseignants et jurys éligibles EMSI")
    public ResponseEntity<List<Map<String, String>>> listerEnseignants() {
        return ResponseEntity.ok(enseignantsDisponibles);
    }

    // ================= DÉFICITS & RECRUTEMENT RH IA =================

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
        Map<String, Object> resultat = openRouterAiService.analyserCvCandidat(cvTexte, matieres);
        return ResponseEntity.ok(resultat);
    }
}
