package ma.emsi.academic.planning;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.enums.*;
import ma.emsi.academic.dto.planning.SaveSeanceRequest;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"logging.level.root=WARN", "logging.level.org.springframework=WARN", "logging.level.org.hibernate=WARN"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PlanningIntegrationTest {
    @Autowired MockMvc http;
    @Autowired ObjectMapper mapper;
    @Autowired CampusRepository campuses;
    @Autowired GroupeRepository groupes;
    @Autowired FiliereRepository filieres;
    @Autowired SalleRepository salles;
    @Autowired EnseignantRepository enseignants;
    @Autowired ModuleRepository modules;
    @Autowired ElementModuleRepository elements;
    @Autowired SeanceRepository seances;
    @Autowired EtudiantRepository students;
    @Autowired AbsenceRepository absences;
    @Autowired ma.emsi.academic.service.AbsenceService absenceService;
    @Autowired UtilisateurRepository users;
    @Autowired JwtTokenProvider tokens;
    Campus campus;
    Groupe group;
    Salle room;
    Enseignant teacher;
    ElementModule element;
    String authorization;

    @BeforeEach void prepare() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        campus = campuses.save(Campus.builder().nom("Campus " + suffix).ville("Marrakech").adresse("Adresse de test").build());
        var filiere = filieres.save(Filiere.builder().code("F" + suffix).libelle("Filière de test").build());
        group = groupes.save(Groupe.builder().codeGroupe("G" + suffix).filiere(filiere).campusFixe(campus).anneeEtude(3).effectif(20).build());
        room = salles.save(Salle.builder().codeSalle("S" + suffix).campus(campus).typeSalle(TypeSalle.LI_PC).capacite(30).nombrePcOperationnels(30).build());
        teacher = enseignants.save(Enseignant.builder().matricule("E" + suffix).nom("Enseignant").prenom("Test").email(suffix + "@example.invalid").typeContrat(TypeContrat.PERMANENT).build());
        var module = modules.save(ma.emsi.academic.domain.entity.Module.builder().codeModule("M" + suffix).intitule("Module de test").filiere(filiere).build());
        element = elements.save(ElementModule.builder().codeElement("EL" + suffix).intitule("Élément de test").module(module).typeSalleRequis(TypeSalle.LI_PC).build());
        authorization = bearer(RoleEnum.ROLE_RESPONSABLE_PLANNING);
    }
    String bearer(RoleEnum role) {
        String value = UUID.randomUUID().toString();
        var user = users.save(Utilisateur.builder().username(value).email(value + "@example.invalid").nom("Test").prenom("Compte").passwordHash("unused-in-token-test").role(role).campus(campus).build());
        return "Bearer " + tokens.generateToken(CustomUserDetails.build(user));
    }
    SaveSeanceRequest request(CreneauHoraire slot, int span) {
        return new SaveSeanceRequest(group.getId(), room.getId(), teacher.getId(), element.getId(), JourSemaine.LUNDI, slot, span);
    }
    @Test void workspaceRequiresPlanningRole() throws Exception {
        http.perform(get("/api/v1/planning/workspace")).andExpect(status().isUnauthorized());
        http.perform(get("/api/v1/planning/workspace").header("Authorization", bearer(RoleEnum.ROLE_ETUDIANT))).andExpect(status().isForbidden());
        http.perform(get("/api/v1/planning/workspace").header("Authorization", authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.campuses").isArray()).andExpect(jsonPath("$.seances").isArray());
    }
    @Test void browserPreflightAllowsConfiguredFrontend() throws Exception {
        http.perform(options("/api/v1/auth/login").header("Origin", "http://localhost:3000").header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        http.perform(options("/api/v1/auth/login").header("Origin", "https://untrusted.example.invalid").header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
    @Test void sessionCrudPersistsAndRejectsOverlapsAcrossSlots() throws Exception {
        String body = http.perform(post("/api/v1/planning/seances").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(CreneauHoraire.S1_08H30, 2))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(body).get("id").asText();
        http.perform(post("/api/v1/planning/seances").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(CreneauHoraire.S2_10H15, 1))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").isNotEmpty());
        http.perform(put("/api/v1/planning/seances/" + id).header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(CreneauHoraire.S3_12H00, 1))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.numeroCreneau").value("S3_12H00"));
        http.perform(delete("/api/v1/planning/seances/" + id).header("Authorization", authorization)).andExpect(status().isNoContent());
        http.perform(delete("/api/v1/planning/seances/" + id).header("Authorization", authorization)).andExpect(status().isNotFound());
    }
    @Test void insufficientEquipmentAndOutOfRangeSpanAreRejected() throws Exception {
        room.setNombrePcOperationnels(10); salles.saveAndFlush(room);
        http.perform(post("/api/v1/planning/seances").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(CreneauHoraire.S1_08H30, 1)))).andExpect(status().isBadRequest());
        room.setNombrePcOperationnels(30); salles.saveAndFlush(room);
        http.perform(post("/api/v1/planning/seances").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(CreneauHoraire.S6_17H15, 2)))).andExpect(status().isBadRequest());
    }
    @Test void publicRegistrationCannotGrantPlanningOrAdminRole() throws Exception {
        String value = UUID.randomUUID().toString();
        var payload = Map.of("username", value, "password", UUID.randomUUID().toString(), "email", value + "@example.invalid", "nom", "Test", "prenom", "Compte", "role", "ROLE_SUPER_ADMIN");
        http.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(payload))).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ROLE_ETUDIANT"));
    }
    @Test void moduleCreationAndLegacyAvailabilityAreUsableByPlanning() throws Exception {
        var body = Map.of("code", "MOD-" + UUID.randomUUID().toString().substring(0, 8), "intitule", "Module créé via API", "filiereId", group.getFiliere().getId(), "semestre", "S1", "volumeHoraire", 45, "typeSalleRequis", "LI_PC");
        http.perform(post("/api/v1/planning/modules").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body))).andExpect(status().isCreated()).andExpect(jsonPath("$.message").isNotEmpty());
        teacher.setDisponibilitesFixesJson("{\"jours\":[\"MARDI\"],\"plages\":[\"08h30-11h45\"]}"); enseignants.saveAndFlush(teacher);
        http.perform(post("/api/v1/planning/seances").header("Authorization", authorization).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(request(CreneauHoraire.S1_08H30, 1)))).andExpect(status().isBadRequest());
        http.perform(get("/api/v1/planning/workspace").header("Authorization", authorization)).andExpect(status().isOk());
    }
    @Test void absenceJustificationAndDeletionRecalculateStudentTotals() throws Exception {
        var session = seances.saveAndFlush(Seance.builder().groupe(group).salle(room).enseignant(teacher).elementModule(element).jourSemaine(JourSemaine.LUNDI).numeroCreneau(CreneauHoraire.S1_08H30).build());
        String suffix = UUID.randomUUID().toString();
        var student = students.saveAndFlush(Etudiant.builder().matricule(suffix).nom("Test").prenom("Étudiant").email(suffix + "@example.invalid").groupe(group).totalHeuresModuleSemestre(new java.math.BigDecimal("7.50")).build());
        var recorded = absenceService.enregistrerAbsence(student.getId(), session.getId(), "Test");
        org.junit.jupiter.api.Assertions.assertEquals(0, student.getCumulHeuresAbsence().compareTo(new java.math.BigDecimal("1.5")));
        org.junit.jupiter.api.Assertions.assertTrue(student.getEstRadieExamen());
        http.perform(delete("/api/v1/planning/seances/" + session.getId()).header("Authorization", authorization)).andExpect(status().isBadRequest());
        http.perform(delete("/api/v1/groupes/" + group.getId()).header("Authorization", authorization)).andExpect(status().isBadRequest());
        absenceService.justifierAbsence(recorded.getId(), "Justificatif de test", true);
        org.junit.jupiter.api.Assertions.assertEquals(0, student.getCumulHeuresAbsence().signum());
        org.junit.jupiter.api.Assertions.assertFalse(student.getEstRadieExamen());
        absenceService.justifierAbsence(recorded.getId(), "Non justifié", false);
        absenceService.deleteAbsence(recorded.getId());
        org.junit.jupiter.api.Assertions.assertEquals(0, student.getCumulHeuresAbsence().signum());
    }
}
