package ma.emsi.academic.service.solver;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class OrToolsTimetableSolverTest {

    private OrToolsTimetableSolver solver;

    @BeforeEach
    void setUp() {
        solver = new OrToolsTimetableSolver();
    }

    @Test
    @DisplayName("Vérifie les 3 règles dures EMSI : Vacataire P1, Campus Fixe, et Type Salle LI_PC / LR_RESEAUX")
    void testResoudrePlanification_RespecteLes3ReglesDures() {
        List<Map<String, Object>> cours = List.of(
            // RÈGLE 1 & RÈGLE 3 : Vacataire avec créneau rigide C1, nécessite LI_PC
            Map.of(
                "id", 1,
                "titreElement", "TP Cloud Kubernetes",
                "necessiteSallePc", true,
                "typeSalleRequis", "LI_PC",
                "nomProf", "Dr. Alami (Vacataire)",
                "statutEnseignant", "VACATAIRE",
                "creneauRigide", "C1",
                "nomGroupe", "5A-IIR-G1",
                "effectif", 25,
                "campusDuJour", "Campus Guéliz"
            ),
            // RÈGLE 3 : TP Réseaux Cisco requiert LR_RESEAUX
            Map.of(
                "id", 2,
                "titreElement", "TP Réseaux Cisco",
                "necessiteSallePc", false,
                "typeSalleRequis", "LR_RESEAUX",
                "nomProf", "Pr. Berrada (Vacataire)",
                "statutEnseignant", "VACATAIRE",
                "creneauRigide", "C2",
                "nomGroupe", "5A-IIR-G1",
                "effectif", 25,
                "campusDuJour", "Campus Guéliz"
            ),
            // RÈGLE 2 : Groupe 5A-GI-G1 fixé sur Campus Targa
            Map.of(
                "id", 3,
                "titreElement", "Cours Automatisme & SCADA",
                "necessiteSallePc", false,
                "typeSalleRequis", "STANDARD",
                "nomProf", "Pr. Tazi (Permanent)",
                "statutEnseignant", "PERMANENT",
                "nomGroupe", "5A-GI-G1",
                "effectif", 20,
                "campusDuJour", "Campus Targa"
            )
        );

        List<Map<String, Object>> salles = List.of(
            // Campus Guéliz
            Map.of("code", "G-LI-PC-01", "type", "LI_PC", "capacite", 35, "nombrePc", 35, "campus", "Campus Guéliz"),
            Map.of("code", "G-LR-RES-01", "type", "LR_RESEAUX", "capacite", 30, "nombrePc", 10, "campus", "Campus Guéliz"),
            Map.of("code", "G-STD-101", "type", "STANDARD", "capacite", 40, "nombrePc", 0, "campus", "Campus Guéliz"),

            // Campus Targa
            Map.of("code", "T-STD-01", "type", "STANDARD", "capacite", 30, "nombrePc", 0, "campus", "Campus Targa")
        );

        List<Map<String, Object>> creneaux = List.of(
            Map.of("id", "C1", "jour", "Lundi", "libelle", "08:30 - 10:00 (Matin 1)"),
            Map.of("id", "C2", "jour", "Lundi", "libelle", "10:15 - 11:45 (Matin 2)"),
            Map.of("id", "C3", "jour", "Lundi", "libelle", "13:15 - 14:45 (Après-Midi 1)")
        );

        Map<String, Object> resultat = solver.resoudrePlanification(cours, salles, creneaux);

        assertNotNull(resultat);
        assertEquals(3, resultat.get("totalSeancesPlanifiees"));
        assertEquals("100% SANS CONFLIT", resultat.get("tauxSucces"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> planning = (List<Map<String, Object>>) resultat.get("planning");
        assertNotNull(planning);
        assertEquals(3, planning.size());

        for (Map<String, Object> seance : planning) {
            String titre = (String) seance.get("titreElement");
            String salle = (String) seance.get("salleAffectee");
            String campus = (String) seance.get("campus");
            String creneauId = (String) seance.get("creneauId");

            if ("TP Cloud Kubernetes".equals(titre)) {
                // Règle 1 : Créneau rigide C1 respecté
                assertEquals("C1", creneauId);
                // Règle 2 : Campus Guéliz respecté
                assertEquals("Campus Guéliz", campus);
                // Règle 3 : Salle LI_PC respectée
                assertEquals("G-LI-PC-01", salle);
            } else if ("TP Réseaux Cisco".equals(titre)) {
                // Règle 1 : Créneau rigide C2 respecté
                assertEquals("C2", creneauId);
                // Règle 2 : Campus Guéliz respecté
                assertEquals("Campus Guéliz", campus);
                // Règle 3 : Salle LR_RESEAUX respectée
                assertEquals("G-LR-RES-01", salle);
            } else if ("Cours Automatisme & SCADA".equals(titre)) {
                // Règle 2 : Campus Targa respecté
                assertEquals("Campus Targa", campus);
                assertEquals("T-STD-01", salle);
            }
        }
    }
}
