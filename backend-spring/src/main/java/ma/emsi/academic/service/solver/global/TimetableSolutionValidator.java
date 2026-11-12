package ma.emsi.academic.service.solver.global;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import static ma.emsi.academic.service.solver.global.TimetableProblem.*;

/** Independent of OR-Tools and candidate generation; also run inside approval transaction. */
@Component
public class TimetableSolutionValidator {
    public List<String> inputs(TimetableProblem p) {
        var errors = new LinkedHashSet<String>();
        if (p.requirements().isEmpty()) errors.add("Saisissez au moins un besoin pédagogique hebdomadaire.");
        var teachers = index(p.teachers(), Teacher::id); var groups = index(p.groups(), Group::id); var elements = index(p.elements(), Element::id);
        var keys = new HashSet<String>();
        for (var r : p.requirements()) {
            var t = teachers.get(r.teacherId()); var g = groups.get(r.groupId()); var e = elements.get(r.elementId());
            String prefix = "Besoin " + r.id() + " : ";
            if (t == null || g == null || e == null) { errors.add(prefix + "ressource ou enseignant préaffecté introuvable."); continue; }
            if (!keys.add(r.groupId() + ":" + r.elementId())) errors.add(prefix + "besoin groupe/élément dupliqué.");
            if (r.weeklySessions() < 1 || r.weeklySessions() > p.calendar().days().size() * p.calendar().slots().size()) errors.add(prefix + "nombre de séances hors capacité hebdomadaire.");
            if (!g.filiereId().equals(e.filiereId())) errors.add(prefix + "le module ne correspond pas à la filière du groupe.");
            if (!t.active()) errors.add(prefix + "enseignant inactif.");
            if (!p.qualifications().contains(new Qualification(t.id(), e.moduleId()))) errors.add(prefix + "qualification enseignant/module non renseignée.");
            if (t.visiting() && t.availability().stream().allMatch(a -> a.creneaux().isEmpty())) errors.add(prefix + "disponibilités du vacataire obligatoires.");
            long existing = matching(p.existing(), r);
            if (existing > r.weeklySessions()) errors.add(prefix + "les séances conservées dépassent le besoin ; ajustez le besoin ou examinez ces séances manuellement.");
            if (p.existing().stream().anyMatch(a -> a.groupId().equals(r.groupId()) && a.elementId().equals(r.elementId()) && !a.teacherId().equals(r.teacherId()))) errors.add(prefix + "une séance existante utilise un autre enseignant ; aucune séance ne sera remplacée automatiquement.");
        }
        errors.addAll(validate(p, List.of(), false));
        return List.copyOf(errors);
    }
    public List<String> validate(TimetableProblem p, List<Assignment> proposed, boolean complete) {
        var errors = new LinkedHashSet<String>();
        var rooms = index(p.rooms(), Room::id); var teachers = index(p.teachers(), Teacher::id);
        var groups = index(p.groups(), Group::id); var elements = index(p.elements(), Element::id);
        var reqs = index(p.requirements(), Requirement::id);
        var all = new ArrayList<>(p.existing()); all.addAll(proposed);
        var roomUse = new HashSet<String>(); var teacherUse = new HashSet<String>(); var groupUse = new HashSet<String>();
        var teacherCampus = new HashMap<String, String>(); var groupCampus = new HashMap<String, String>();
        var teacherMinutes = new HashMap<String, Integer>();
        for (var a : proposed) {
            var r = reqs.get(a.requirementId());
            if (r == null || !r.groupId().equals(a.groupId()) || !r.elementId().equals(a.elementId()) || !r.teacherId().equals(a.teacherId())) errors.add("Une affectation ne correspond pas à son besoin pédagogique.");
        }
        for (var a : all) {
            var room = rooms.get(a.roomId()); var teacher = teachers.get(a.teacherId()); var group = groups.get(a.groupId()); var element = elements.get(a.elementId());
            if (room == null || teacher == null || group == null || element == null) { errors.add("Une affectation référence une ressource absente."); continue; }
            if (!p.calendar().days().contains(a.day()) || p.calendar().slots().stream().noneMatch(s -> s.code().equals(a.slot()))) errors.add("Une séance utilise un créneau fermé ou chevauche la pause configurée : " + a.day() + " / " + a.slot());
            if (!teacher.active() || !room.available()) errors.add("Enseignant ou salle indisponible.");
            if (!p.qualifications().contains(new Qualification(teacher.id(), element.moduleId()))) errors.add("Qualification manquante pour l’enseignant " + teacher.id() + " et le module " + element.moduleId() + ".");
            if (!group.filiereId().equals(element.filiereId())) errors.add("Module et filière incompatibles.");
            if (!room.campusId().equals(group.campusId())) errors.add("Campus fixe du groupe non respecté.");
            if (room.capacity() < group.size()) errors.add("Capacité de salle insuffisante.");
            if (!"STANDARD".equals(element.roomType()) && !Objects.equals(element.roomType(), room.type())) errors.add("Équipement/type de salle incompatible.");
            if ("LI_PC".equals(element.roomType()) && room.pcs() < group.size()) errors.add("Nombre de postes opérationnels insuffisant.");
            if ((teacher.visiting() || !teacher.availability().isEmpty()) && teacher.availability().stream().noneMatch(d -> d.jour().equals(a.day()) && d.creneaux().contains(a.slot()))) errors.add("Disponibilité enseignant non respectée.");
            String time = a.day() + ":" + a.slot();
            if (!roomUse.add(a.roomId() + ":" + time)) errors.add("Conflit de salle.");
            if (!teacherUse.add(a.teacherId() + ":" + time)) errors.add("Conflit enseignant.");
            if (!groupUse.add(a.groupId() + ":" + time)) errors.add("Conflit de groupe.");
            String oldTeacher = teacherCampus.putIfAbsent(a.teacherId() + ":" + a.day(), room.campusId());
            String oldGroup = groupCampus.putIfAbsent(a.groupId() + ":" + a.day(), room.campusId());
            if (oldTeacher != null && !oldTeacher.equals(room.campusId())) errors.add("Un enseignant change de campus dans la journée.");
            if (oldGroup != null && !oldGroup.equals(room.campusId())) errors.add("Un groupe change de campus dans la journée.");
            teacherMinutes.merge(a.teacherId(), p.calendar().slotMinutes(), Integer::sum);
        }
        teacherMinutes.forEach((id, minutes) -> { if (minutes > teachers.get(id).weeklyHours() * 60) errors.add("Charge contractuelle dépassée pour l’enseignant " + id + "."); });
        if (complete) for (var r : p.requirements()) if (matching(all, r) != r.weeklySessions()) errors.add("Nombre de séances incorrect pour le besoin " + r.id() + ".");
        return List.copyOf(errors);
    }
    public static long matching(List<Assignment> assignments, Requirement r) {
        return assignments.stream().filter(a -> a.groupId().equals(r.groupId()) && a.elementId().equals(r.elementId()) && a.teacherId().equals(r.teacherId())).count();
    }
    public int groupHoles(TimetableProblem p, List<Assignment> proposed) {
        var all = new ArrayList<>(p.existing()); all.addAll(proposed); int holes = 0;
        for (var g : p.groups()) for (var day : p.calendar().days()) {
            var indices = new TreeSet<Integer>();
            for (var a : all) if (a.groupId().equals(g.id()) && a.day().equals(day)) for (int i = 0; i < p.calendar().slots().size(); i++) if (p.calendar().slots().get(i).code().equals(a.slot())) indices.add(i);
            if (!indices.isEmpty()) holes += indices.last() - indices.first() + 1 - indices.size();
        }
        return holes;
    }
    private static <T> Map<String,T> index(List<T> values, Function<T,String> key) { return values.stream().collect(Collectors.toMap(key, Function.identity())); }
}
