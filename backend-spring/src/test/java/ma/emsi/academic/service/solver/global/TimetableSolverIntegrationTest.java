package ma.emsi.academic.service.solver.global;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.enums.*;
import ma.emsi.academic.domain.solver.*;
import ma.emsi.academic.dto.planning.TimetableSolveResult;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.security.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"logging.level.root=WARN","logging.level.org.hibernate.SQL=WARN","logging.level.org.hibernate.orm.jdbc.bind=WARN","univora.timetable.max-seconds=5"})
@AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class TimetableSolverIntegrationTest {
    @Autowired MockMvc http; @Autowired ObjectMapper mapper;
    @Autowired CampusRepository campuses; @Autowired GroupeRepository groups;
    @Autowired FiliereRepository filieres; @Autowired SalleRepository rooms;
    @Autowired EnseignantRepository teachers; @Autowired ModuleRepository modules;
    @Autowired ElementModuleRepository elements; @Autowired SeanceRepository sessions;
    @Autowired TeachingRequirementRepository needs; @Autowired TeacherQualificationRepository qualifications;
    @Autowired TimetableProposalRepository proposals; @Autowired UtilisateurRepository users;
    @Autowired JwtTokenProvider tokens;
    String authorization; Campus campus; String owner;
    final Map<String,Groupe> groupMap=new HashMap<>(); final Map<String,ElementModule> elementMap=new HashMap<>();
    final Map<String,Enseignant> teacherMap=new HashMap<>();
    final String root="/api/v1/planning/solver";
    @BeforeEach void fixture() throws Exception {
        String suffix=UUID.randomUUID().toString().substring(0,8); var p=TimetableSolverFixture.problem();
        var campusMap=new HashMap<String,Campus>();
        for(String id:List.of("A","B")) campusMap.put(id, campuses.saveAndFlush(Campus.builder().nom("Fictif "+id+suffix).ville("Test").adresse("Fixture isolée").build()));
        campus=campusMap.get("A");
        var filiereMap=new HashMap<String,Filiere>();
        for(String id:List.of("F1","F2")) filiereMap.put(id,filieres.saveAndFlush(Filiere.builder().code(id+suffix).libelle("Filière fictive "+id).build()));
        for(var r:p.rooms()) rooms.saveAndFlush(Salle.builder().codeSalle("R"+r.id()+suffix).campus(campusMap.get(r.campusId())).typeSalle(TypeSalle.valueOf(r.type())).capacite(r.capacity()).nombrePcOperationnels(r.pcs()).build());
        for(var g:p.groups()) groupMap.put(g.id(),groups.saveAndFlush(Groupe.builder().codeGroupe("G"+g.id()+suffix).campusFixe(campusMap.get(g.campusId())).filiere(filiereMap.get(g.filiereId())).anneeEtude(3).effectif(g.size()).build()));
        for(var t:p.teachers()) teacherMap.put(t.id(),teachers.saveAndFlush(Enseignant.builder().matricule("T"+t.id()+suffix).nom("Enseignant fictif "+t.id()).prenom("Test").email(t.id()+suffix+"@example.invalid").typeContrat(t.visiting()?TypeContrat.VACATAIRE:TypeContrat.PERMANENT).heuresContractuellesSemaine(t.weeklyHours()).disponibilitesFixesJson(mapper.writeValueAsString(t.availability())).build()));
        for(var e:p.elements()) {
            var m=modules.saveAndFlush(ma.emsi.academic.domain.entity.Module.builder().codeModule(e.moduleId()+suffix).intitule("Module fictif "+e.id()).filiere(filiereMap.get(e.filiereId())).semestre("S5").volumeHoraireTotal(45).build());
            elementMap.put(e.id(),elements.saveAndFlush(ElementModule.builder().codeElement("E"+e.id()+suffix).intitule("Élément fictif "+e.id()).module(m).typeSalleRequis(TypeSalle.valueOf(e.roomType())).volumeHoraire(45).build()));
        }
        for(var r:p.requirements()) {
            var q=new TeacherQualification();q.setEnseignantId(teacherMap.get(r.teacherId()).getId());q.setModuleId(elementMap.get(r.elementId()).getModule().getId());qualifications.saveAndFlush(q);
            var n=new TeachingRequirement();n.setGroupeId(groupMap.get(r.groupId()).getId());n.setElementId(elementMap.get(r.elementId()).getId());n.setEnseignantId(teacherMap.get(r.teacherId()).getId());n.setWeeklySessions(r.weeklySessions());needs.saveAndFlush(n);
        }
        owner="planner-"+suffix; authorization=bearer(owner,RoleEnum.ROLE_RESPONSABLE_PLANNING);
    }
    String bearer(String name,RoleEnum role) {
        var u=users.saveAndFlush(Utilisateur.builder().username(name).email(name+"@example.invalid").nom("Fixture").prenom("Test").passwordHash("unused").role(role).campus(campus).build());
        return "Bearer "+tokens.generateToken(CustomUserDetails.build(u));
    }
    TimetableSolveResult solve() throws Exception {
        var body=http.perform(post(root+"/solve").header("Authorization",authorization)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var r=mapper.readValue(body,TimetableSolveResult.class);assertTrue(r.validated(),r.status()+r.diagnostics());assertNotNull(r.proposalId());return r;
    }
    @Test void endpointsRequirePlanningRole() throws Exception {
        http.perform(get(root+"/calendar")).andExpect(status().isUnauthorized());
        http.perform(post(root+"/solve").header("Authorization",bearer("student-"+UUID.randomUUID(),RoleEnum.ROLE_ETUDIANT))).andExpect(status().isForbidden());
        http.perform(get(root+"/calendar").header("Authorization",authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.slotMinutes").value(90)).andExpect(jsonPath("$.slots.length()").value(5));
    }
    @Test void solvingDoesNotPublishAndAcceptanceIsPersistentAndIdempotent() throws Exception {
        long before=sessions.count();var r=solve();assertEquals(before,sessions.count());assertEquals(18,r.assignedSessions());assertTrue(proposals.existsById(r.proposalId()));
        http.perform(post(root+"/proposals/"+r.proposalId()+"/accept").header("Authorization",authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.proposalState").value("ACCEPTED"));
        assertEquals(before+18,sessions.count());
        http.perform(get("/api/v1/planning/workspace").header("Authorization",authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.seances.length()").value(18));
        http.perform(post(root+"/proposals/"+r.proposalId()+"/accept").header("Authorization",authorization)).andExpect(status().isOk());assertEquals(before+18,sessions.count());
        assertTrue(sessions.findAll().stream().allMatch(s->s.getStatutAffectation().startsWith("CPSAT_")));
    }
    @Test void rejectionNeverPublishes() throws Exception {
        var r=solve();http.perform(post(root+"/proposals/"+r.proposalId()+"/reject").header("Authorization",authorization)).andExpect(status().isOk()).andExpect(jsonPath("$.proposalState").value("REJECTED"));assertEquals(0,sessions.count());
        http.perform(post(root+"/proposals/"+r.proposalId()+"/accept").header("Authorization",authorization)).andExpect(status().isConflict());
    }
    @Test void changedResourceRejectsApprovalWithoutPublishing() throws Exception {
        var r=solve();var room=rooms.findAll().getFirst();room.setCapacite(room.getCapacite()+1);rooms.saveAndFlush(room);
        http.perform(post(root+"/proposals/"+r.proposalId()+"/accept").header("Authorization",authorization)).andExpect(status().isConflict()).andExpect(jsonPath("$.message").exists());assertEquals(0,sessions.count());
    }
    @Test void expiredProposalCannotBeApproved() throws Exception {
        var r=solve();var p=proposals.findById(r.proposalId()).orElseThrow();p.setExpiresAt(Instant.now().minusSeconds(1));proposals.saveAndFlush(p);
        http.perform(post(root+"/proposals/"+r.proposalId()+"/accept").header("Authorization",authorization)).andExpect(status().isConflict());assertEquals(0,sessions.count());
    }
    @Test void proposalBelongsToItsAuthor() throws Exception {
        var r=solve();String other=bearer("other-"+UUID.randomUUID(),RoleEnum.ROLE_RESPONSABLE_PLANNING);
        http.perform(get(root+"/proposals/"+r.proposalId()).header("Authorization",other)).andExpect(status().isForbidden());
        http.perform(post(root+"/proposals/"+r.proposalId()+"/accept").header("Authorization",other)).andExpect(status().isForbidden());assertEquals(0,sessions.count());
    }
    @Test void existingManualSessionIsNeverReplaced() throws Exception {
        var a=solve().assignments().getFirst();
        var session=Seance.builder().groupe(groups.findById(Long.valueOf(a.groupId())).orElseThrow()).enseignant(teachers.findById(Long.valueOf(a.teacherId())).orElseThrow()).salle(rooms.findById(Long.valueOf(a.roomId())).orElseThrow()).elementModule(elements.findById(Long.valueOf(a.elementId())).orElseThrow()).jourSemaine(JourSemaine.valueOf(a.day())).numeroCreneau(CreneauHoraire.valueOf(a.slot())).statutAffectation("MANUEL").build();session=sessions.saveAndFlush(session);Long id=session.getId();
        var next=solve();assertEquals(17,next.assignedSessions());http.perform(post(root+"/proposals/"+next.proposalId()+"/accept").header("Authorization",authorization)).andExpect(status().isOk());assertEquals(18,sessions.count());assertEquals("MANUEL",sessions.findById(id).orElseThrow().getStatutAffectation());
    }
    @Test void requirementApiValidatesQualificationAndCounts() throws Exception {
        http.perform(post(root+"/requirements").header("Authorization",authorization).contentType(MediaType.APPLICATION_JSON).content("{\"weeklySessions\":1}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message",org.hamcrest.Matchers.containsString("obligatoire")));
        var n=needs.findAll().getFirst();
        String invalid=mapper.writeValueAsString(Map.of("groupeId",n.getGroupeId(),"elementId",n.getElementId(),"enseignantId",n.getEnseignantId(),"weeklySessions",0));
        http.perform(put(root+"/requirements/"+n.getId()).header("Authorization",authorization).contentType(MediaType.APPLICATION_JSON).content(invalid)).andExpect(status().isBadRequest());
        String valid=mapper.writeValueAsString(Map.of("groupeId",n.getGroupeId(),"elementId",n.getElementId(),"enseignantId",n.getEnseignantId(),"weeklySessions",2));
        http.perform(put(root+"/requirements/"+n.getId()).header("Authorization",authorization).contentType(MediaType.APPLICATION_JSON).content(valid)).andExpect(status().isOk()).andExpect(jsonPath("$.weeklySessions").value(2));
    }
    @Test void requirementAndQualificationDeletionDoNotDeleteSessions() throws Exception {
        var n=needs.findAll().getFirst();var q=qualifications.findAll().stream().filter(x->x.getEnseignantId().equals(n.getEnseignantId())&&x.getModuleId().equals(elements.findById(n.getElementId()).orElseThrow().getModule().getId())).findFirst().orElseThrow();
        http.perform(delete(root+"/qualifications/"+q.getId()).header("Authorization",authorization)).andExpect(status().isBadRequest());
        http.perform(delete(root+"/requirements/"+n.getId()).header("Authorization",authorization)).andExpect(status().isNoContent());assertEquals(0,sessions.count());
        http.perform(delete(root+"/qualifications/"+q.getId()).header("Authorization",authorization)).andExpect(status().isNoContent());
    }
}
