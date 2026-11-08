package ma.emsi.academic.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ma.emsi.academic.service.ai.GeminiAiServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/v1/pfe")
@CrossOrigin(origins = "*")
@Tag(name = "Gestion PFE & Intelligence Artificielle", description = "CRUD des PFE, Matching IA des jurys de soutenance (Gemini 2.0 Flash) & Analyse RH")
public class PfeAiController {

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

    public PfeAiController(GeminiAiServiceClient geminiAiClient) {
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
            "Matching optimal validé par l'IA : Le rapporteur possède une affinité de 94.5% avec Spring Cloud et Docker. Encadrant non inclus dans le jury (déontologie respectée)."
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
        pfe.put("problematique", problematique);
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

    // ================= MOTEUR MATCHING IA =================

    @PostMapping("/{id}/match-jury")
    @Operation(summary = "Lancer le matching IA sémantique pour affecter le jury de ce PFE")
    public ResponseEntity<Map<String, Object>> matcherJuryPourPfe(@PathVariable Long id) {
        Map<String, Object> pfe = pfeDatabase.get(id);
        if (pfe == null) {
            return ResponseEntity.notFound().build();
        }

        String titre = (String) pfe.getOrDefault("titre", "");
        String problematique = (String) pfe.getOrDefault("problematique", "");
        String encadrant = (String) pfe.getOrDefault("encadrantNom", "");

        // RÈGLE ÉTHIQUE STRICTE (BR-PFE-07) : Filtrer les enseignants pour exclure l'encadrant du jury
        List<Map<String, String>> enseignantsEligibles = enseignantsDisponibles.stream()
                .filter(prof -> !prof.get("nom").equalsIgnoreCase(encadrant))
                .toList();

        Map<String, Object> resultatIa = geminiAiClient.matcherJuryPfe(titre, problematique, enseignantsEligibles);

        // Mettre à jour le projet PFE avec les recommandations de l'IA
        pfe.put("presidentJury", resultatIa.get("presidentRecommande"));
        pfe.put("rapporteurJury", resultatIa.get("rapporteurRecommande"));
        pfe.put("examinateurJury", resultatIa.get("examinateurRecommande"));
        pfe.put("scoreMatchingIa", resultatIa.get("scoreGlobalMatching"));
        pfe.put("justificationIa", resultatIa.get("justificationIa"));
        pfe.put("modeExecutionIa", resultatIa.get("modeExecution"));
        pfe.put("statut", "JURY_AFFECTE");
        pfe.put("dateMiseAJour", LocalDateTime.now().toString());

        Map<String, Object> reponse = new HashMap<>(resultatIa);
        reponse.put("pfe", pfe);
        reponse.put("regleEthiqueValidee", "Encadrant (" + encadrant + ") formellement exclu du jury");
        return ResponseEntity.ok(reponse);
    }

    @PostMapping("/match-jury-direct")
    @Operation(summary = "Matching IA instantané à partir de texte libre")
    public ResponseEntity<Map<String, Object>> matcherJuryDirect(@RequestBody Map<String, String> request) {
        String titre = request.getOrDefault("titre", "Projet PFE EMSI");
        String resume = request.getOrDefault("resume", "");
        String encadrant = request.getOrDefault("encadrant", "");

        List<Map<String, String>> enseignantsEligibles = enseignantsDisponibles.stream()
                .filter(prof -> encadrant.isBlank() || !prof.get("nom").equalsIgnoreCase(encadrant))
                .toList();

        Map<String, Object> resultat = geminiAiClient.matcherJuryPfe(titre, resume, enseignantsEligibles);
        return ResponseEntity.ok(resultat);
    }

    @GetMapping("/enseignants")
    @Operation(summary = "Lister les enseignants et jurys disponibles")
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
        Map<String, Object> resultat = geminiAiClient.analyserCvCandidat(cvTexte, matieres);
        return ResponseEntity.ok(resultat);
    }
}
