package ma.emsi.academic.service.solver.global;

import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.enums.*;
import ma.emsi.academic.domain.solver.*;
import ma.emsi.academic.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

/** Real commits and two concurrent transactions, in a separate in-memory database. */
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:concurrent_solver;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER","logging.level.root=WARN","logging.level.org.hibernate.SQL=WARN","logging.level.org.springframework.web=WARN","univora.timetable.max-seconds=3"})
@ActiveProfiles("test") @DirtiesContext(classMode=DirtiesContext.ClassMode.AFTER_CLASS)
class TimetableConcurrentApprovalTest {
    @Autowired PlatformTransactionManager transactions;
    @Autowired CampusRepository campuses; @Autowired FiliereRepository filieres;
    @Autowired GroupeRepository groups; @Autowired SalleRepository rooms;
    @Autowired EnseignantRepository teachers; @Autowired ModuleRepository modules;
    @Autowired ElementModuleRepository elements; @Autowired TeachingRequirementRepository needs;
    @Autowired TeacherQualificationRepository qualifications; @Autowired SeanceRepository sessions;
    @Autowired TimetableSolverService solver; @Autowired TimetableProposalService proposals;
    @Test void concurrentApprovalsCommitExactlyOnce() throws Exception {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            var c=campuses.saveAndFlush(Campus.builder().nom("Campus fictif concurrent").ville("Test").adresse("Isolé").build());
            var f=filieres.saveAndFlush(Filiere.builder().code("F-CONCURRENT").libelle("Fictif").build());
            var g=groups.saveAndFlush(Groupe.builder().codeGroupe("G-CONCURRENT").campusFixe(c).filiere(f).anneeEtude(3).effectif(20).build());
            rooms.saveAndFlush(Salle.builder().codeSalle("R-CONCURRENT").campus(c).typeSalle(TypeSalle.STANDARD).capacite(30).build());
            var t=teachers.saveAndFlush(Enseignant.builder().matricule("T-CONCURRENT").nom("Fictif").prenom("Test").email("concurrent@example.invalid").typeContrat(TypeContrat.PERMANENT).build());
            var m=modules.saveAndFlush(ma.emsi.academic.domain.entity.Module.builder().codeModule("M-CONCURRENT").intitule("Fictif").filiere(f).build());
            var e=elements.saveAndFlush(ElementModule.builder().codeElement("E-CONCURRENT").intitule("Fictif").module(m).typeSalleRequis(TypeSalle.STANDARD).build());
            var q=new TeacherQualification();q.setEnseignantId(t.getId());q.setModuleId(m.getId());qualifications.saveAndFlush(q);
            var n=new TeachingRequirement();n.setGroupeId(g.getId());n.setElementId(e.getId());n.setEnseignantId(t.getId());n.setWeeklySessions(3);needs.saveAndFlush(n);
        });
        var result=solver.solve("concurrent-fixture");assertTrue(result.validated());assertEquals(0,sessions.count());
        var ready=new CountDownLatch(2);var start=new CountDownLatch(1);
        try(var pool=Executors.newFixedThreadPool(2)) {
            Callable<String> accept=()->{ready.countDown();assertTrue(start.await(5,TimeUnit.SECONDS));return proposals.accept(result.proposalId(),"concurrent-fixture").proposalState();};
            var first=pool.submit(accept);var second=pool.submit(accept);
            assertTrue(ready.await(5,TimeUnit.SECONDS));start.countDown();
            assertEquals("ACCEPTED",first.get(20,TimeUnit.SECONDS));assertEquals("ACCEPTED",second.get(20,TimeUnit.SECONDS));
        }
        assertEquals(3,sessions.count());
        assertEquals("ACCEPTED",proposals.get(result.proposalId(),"concurrent-fixture").proposalState());
    }
}
