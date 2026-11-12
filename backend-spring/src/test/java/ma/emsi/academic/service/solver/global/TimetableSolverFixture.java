package ma.emsi.academic.service.solver.global;

import java.util.*;
import static ma.emsi.academic.service.solver.global.TimetableProblem.*;
import ma.emsi.academic.dto.planning.PlanningSnapshot.Disponibilite;

/** Fictitious isolated fixture: 2 campuses, 6 rooms, 5 teachers (2 visiting), 3 groups, 6 modules, 18 sessions. */
public final class TimetableSolverFixture {
    private TimetableSolverFixture() {}
    public static TimetableProblem problem() {
        var calendar = new TimetableCalendar(List.of("LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI"),
                List.of("S1_08H30","S2_10H15","S3_12H00","S4_13H45","S5_15H30","S6_17H15"), "11:45", "13:45").definition();
        var slots = calendar.slots().stream().map(TimetableCalendar.Slot::code).toList();
        var rooms = List.of(new Room("1","A","STANDARD",40,0,true),new Room("2","A","LI_PC",35,35,true),new Room("3","A","LR_RESEAUX",30,0,true),new Room("4","B","STANDARD",40,0,true),new Room("5","B","LI_PC",35,35,true),new Room("6","B","AMPHI",80,0,true));
        var teachers = List.of(new Teacher("1",true,false,18,List.of()), new Teacher("2",true,false,18,List.of()),new Teacher("3",true,false,18,List.of()),
                new Teacher("4",true,true,9,List.of(new Disponibilite("LUNDI",slots),new Disponibilite("MERCREDI",slots))),new Teacher("5",true,true,9,List.of(new Disponibilite("JEUDI",slots),new Disponibilite("VENDREDI",slots))));
        var groups = List.of(new Group("1","A","F1",25),new Group("2","A","F1",20),new Group("3","B","F2",25));
        var elements = List.of(new Element("1","M1","F1","STANDARD"),new Element("2","M2","F1","LI_PC"),new Element("3","M3","F1","STANDARD"),new Element("4","M4","F1","LR_RESEAUX"),new Element("5","M5","F2","STANDARD"),new Element("6","M6","F2","LI_PC"));
        var needs = List.of(new Requirement("1","1","1","1",3),new Requirement("2","1","2","4",3),new Requirement("3","2","3","2",3),new Requirement("4","2","4","3",3),new Requirement("5","3","5","1",3),new Requirement("6","3","6","5",3));
        var qualifications = needs.stream().map(r -> new Qualification(r.teacherId(), elements.stream().filter(e -> e.id().equals(r.elementId())).findFirst().orElseThrow().moduleId())).toList();
        return new TimetableProblem(calendar,rooms,teachers,groups,elements,needs,qualifications,List.of());
    }
    public static TimetableProblem with(TimetableProblem p, List<Room> rooms, List<Teacher> teachers, List<Requirement> needs, List<Qualification> qualifications, List<Assignment> existing) {
        return new TimetableProblem(p.calendar(),rooms,teachers,p.groups(),p.elements(),needs,qualifications,existing);
    }
}
