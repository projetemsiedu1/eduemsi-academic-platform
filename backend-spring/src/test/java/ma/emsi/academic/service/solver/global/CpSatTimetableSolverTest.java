package ma.emsi.academic.service.solver.global;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.emsi.academic.dto.planning.TimetableSolveResult;
import org.junit.jupiter.api.*;
import java.nio.file.*;
import java.util.*;
import static ma.emsi.academic.service.solver.global.TimetableProblem.*;
import static org.junit.jupiter.api.Assertions.*;

class CpSatTimetableSolverTest {
    static final TimetableSolutionValidator validator = new TimetableSolutionValidator();
    static final CpSatTimetableSolver solver = new CpSatTimetableSolver(validator);
    static final TimetableProblem fixture = TimetableSolverFixture.problem();
    static TimetableSolveResult solution;
    @BeforeAll static void calculate() throws Exception {
        solution = solver.solve(fixture, 5);
        assertTrue(solution.validated(), solution.status() + " " + solution.diagnostics());
        Files.createDirectories(Path.of("target/solver"));
        Files.writeString(Path.of("target/solver/calculated-fixture.json"), new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(solution));
        Files.writeString(Path.of("target/solver/input-fixture.json"), new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(fixture));
    }
    @Test void generatesEighteenRealSessions() { assertEquals(18,solution.assignedSessions()); assertEquals(18,solution.requestedSessions()); assertTrue(Set.of("OPTIMAL","FEASIBLE").contains(solution.status())); assertTrue(validator.validate(fixture,solution.assignments(),true).isEmpty()); }
    @Test void teacherDoesNotOverlap() { var seen=new HashSet<String>(); solution.assignments().forEach(a -> assertTrue(seen.add(a.teacherId()+a.day()+a.slot()))); }
    @Test void roomDoesNotOverlap() { var seen=new HashSet<String>(); solution.assignments().forEach(a -> assertTrue(seen.add(a.roomId()+a.day()+a.slot()))); }
    @Test void groupDoesNotOverlap() { var seen=new HashSet<String>(); solution.assignments().forEach(a -> assertTrue(seen.add(a.groupId()+a.day()+a.slot()))); }
    @Test void visitingTeachersStayAvailable() { for(var a:solution.assignments()) {var t=fixture.teachers().stream().filter(x->x.id().equals(a.teacherId())).findFirst().orElseThrow();if(t.visiting())assertTrue(t.availability().stream().anyMatch(d->d.jour().equals(a.day())&&d.creneaux().contains(a.slot()))); } }
    @Test void qualificationsAreRespected() { for(var a:solution.assignments()) {var e=fixture.elements().stream().filter(x->x.id().equals(a.elementId())).findFirst().orElseThrow();assertTrue(fixture.qualifications().contains(new Qualification(a.teacherId(),e.moduleId()))); } }
    @Test void computerRoomsHaveEquipmentAndCapacity() { for(var a:solution.assignments()){var e=fixture.elements().stream().filter(x->x.id().equals(a.elementId())).findFirst().orElseThrow();var r=fixture.rooms().stream().filter(x->x.id().equals(a.roomId())).findFirst().orElseThrow();var g=fixture.groups().stream().filter(x->x.id().equals(a.groupId())).findFirst().orElseThrow();assertTrue(r.capacity()>=g.size());if(e.roomType().equals("LI_PC")){assertEquals("LI_PC",r.type());assertTrue(r.pcs()>=g.size());}} }
    @Test void oneCampusPerTeacherAndGroupDay() {var teachers=new HashMap<String,String>();var groups=new HashMap<String,String>();for(var a:solution.assignments()){var campus=fixture.rooms().stream().filter(r->r.id().equals(a.roomId())).findFirst().orElseThrow().campusId();var old=teachers.putIfAbsent(a.teacherId()+a.day(),campus);assertTrue(old==null||old.equals(campus));old=groups.putIfAbsent(a.groupId()+a.day(),campus);assertTrue(old==null||old.equals(campus));} }
    @Test void demandCountsAreExact() {for(var r:fixture.requirements())assertEquals(r.weeklySessions(),TimetableSolutionValidator.matching(solution.assignments(),r));}
    @Test void lunchIsExcludedAndSlotsLastNinetyMinutes() {assertFalse(fixture.calendar().slots().stream().anyMatch(s->s.code().equals("S3_12H00")));solution.assignments().forEach(a->assertNotEquals("S3_12H00",a.slot()));fixture.calendar().slots().forEach(s->assertEquals(90,s.minutes()));}
    @Test void missingQualificationIsAnInputError() {var p=TimetableSolverFixture.with(fixture,fixture.rooms(),fixture.teachers(),fixture.requirements(),List.of(),List.of());assertEquals("INPUT_INVALID",solver.solve(p,1).status());}
    @Test void missingVisitingAvailabilityIsAnInputError() {var ts=fixture.teachers().stream().map(t->new Teacher(t.id(),t.active(),t.visiting(),t.weeklyHours(),List.of())).toList();var p=TimetableSolverFixture.with(fixture,fixture.rooms(),ts,fixture.requirements(),fixture.qualifications(),List.of());assertEquals("INPUT_INVALID",solver.solve(p,1).status());}
    @Test void insufficientRoomsAreProvenInfeasible() {var rooms=fixture.rooms().stream().map(r->new Room(r.id(),r.campusId(),r.type(),1,0,true)).toList();var p=TimetableSolverFixture.with(fixture,rooms,fixture.teachers(),fixture.requirements(),fixture.qualifications(),List.of());var result=solver.solve(p,1);assertEquals("INFEASIBLE",result.status());assertFalse(result.validated());assertTrue(result.assignments().isEmpty());}
    @Test void jointTeacherCapacityCanBeInfeasibleDespiteIndividualDomains() {
        var c=new TimetableCalendar.Calendar(List.of("LUNDI"),List.of(fixture.calendar().slots().getFirst()),"11:45","13:45",90,"Test");
        var needs=List.of(new Requirement("1","1","1","1",1),new Requirement("2","2","3","1",1));
        var p=new TimetableProblem(c,fixture.rooms(),fixture.teachers(),fixture.groups(),fixture.elements(),needs,List.of(new Qualification("1","M1"),new Qualification("1","M3")),List.of());
        assertEquals("INFEASIBLE",solver.solve(p,1).status());
    }
    @Test void solverActuallyMinimizesInteriorHoles() {
        var c=new TimetableCalendar.Calendar(List.of("LUNDI"),fixture.calendar().slots(),"11:45","13:45",90,"Test");
        var fixed=List.of(new Assignment(null,"1","1","1","1","LUNDI","S1_08H30"),new Assignment(null,"1","1","1","1","LUNDI","S4_13H45"));
        var p=new TimetableProblem(c,fixture.rooms(),fixture.teachers(),fixture.groups(),fixture.elements(),List.of(new Requirement("1","1","1","1",3)),fixture.qualifications(),fixed);
        var bad=List.of(new Assignment("1","1","1","1","1","LUNDI","S5_15H30"));assertEquals(1,validator.groupHoles(p,bad));
        var optimal=solver.solve(p,3);assertEquals("OPTIMAL",optimal.status());assertEquals(0.0,optimal.objectiveValue());assertEquals(0.0,optimal.bestObjectiveBound());assertEquals("S2_10H15",optimal.assignments().getFirst().slot());assertEquals(0,validator.groupHoles(p,optimal.assignments()));
    }
    @Test void independentValidatorRejectsTamperedResults() {var broken=new ArrayList<>(solution.assignments());broken.add(broken.getFirst());var errors=validator.validate(fixture,broken,true);assertTrue(errors.contains("Conflit enseignant."));assertTrue(errors.contains("Conflit de salle."));assertTrue(errors.contains("Conflit de groupe."));}
    @Test void existingSessionsArePreservedAndCountTowardDemand() {var first=solution.assignments().getFirst();var p=TimetableSolverFixture.with(fixture,fixture.rooms(),fixture.teachers(),fixture.requirements(),fixture.qualifications(),List.of(new Assignment(null,first.groupId(),first.elementId(),first.teacherId(),first.roomId(),first.day(),first.slot())));var r=solver.solve(p,5);assertTrue(r.validated(),r.diagnostics().toString());assertEquals(17,r.assignedSessions());assertEquals(1,p.existing().size());}
    @Test void validatorRejectsUnqualifiedAssignmentEvenOutsideSolver() {var p=TimetableSolverFixture.with(fixture,fixture.rooms(),fixture.teachers(),fixture.requirements(),List.of(),List.of());assertFalse(validator.validate(p,solution.assignments(),true).isEmpty());}
}
