package ma.emsi.academic.service.solver.global;

import ma.emsi.academic.dto.planning.PlanningSnapshot;
import java.util.List;

/** Detached immutable input. Solver/validator have no access to JPA or HTTP. */
public record TimetableProblem(TimetableCalendar.Calendar calendar, List<Room> rooms, List<Teacher> teachers,
        List<Group> groups, List<Element> elements, List<Requirement> requirements,
        List<Qualification> qualifications, List<Assignment> existing) {
    public record Room(String id, String campusId, String type, int capacity, int pcs, boolean available) {}
    public record Teacher(String id, boolean active, boolean visiting, int weeklyHours, List<PlanningSnapshot.Disponibilite> availability) {}
    public record Group(String id, String campusId, String filiereId, int size) {}
    public record Element(String id, String moduleId, String filiereId, String roomType) {}
    public record Requirement(String id, String groupId, String elementId, String teacherId, int weeklySessions) {}
    public record Qualification(String teacherId, String moduleId) {}
    public record Assignment(String requirementId, String groupId, String elementId, String teacherId, String roomId, String day, String slot) {}
}
