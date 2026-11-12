package ma.emsi.academic.service.solver.global;

import com.google.ortools.Loader;
import com.google.ortools.sat.*;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.planning.TimetableSolveResult;
import org.springframework.stereotype.Component;
import java.util.*;
import static ma.emsi.academic.service.solver.global.TimetableProblem.*;

/** Global CP-SAT model. No heuristic fallback and no fabricated solver status. */
@Component @RequiredArgsConstructor
public class CpSatTimetableSolver {
    private final TimetableSolutionValidator validator;
    private record Candidate(BoolVar decision, Assignment assignment) {}
    private static volatile boolean nativeLoaded;
    private static synchronized void loadNative() { if (!nativeLoaded) { Loader.loadNativeLibraries(); nativeLoaded = true; } }

    public TimetableSolveResult solve(TimetableProblem p, double seconds) {
        long start = System.nanoTime();
        int requested = p.requirements().stream().mapToInt(r -> Math.max(0, r.weeklySessions() - (int) TimetableSolutionValidator.matching(p.existing(), r))).sum();
        var inputErrors = validator.inputs(p);
        if (!inputErrors.isEmpty()) return result("INPUT_INVALID", start, requested, null, null, List.of(), inputErrors, false);
        if (requested > 300) return result("INPUT_INVALID", start, requested, null, null, List.of(), List.of("Prototype limité à 300 nouvelles séances par génération."), false);
        try { loadNative(); } catch (LinkageError | RuntimeException e) {
            return result("NATIVE_UNAVAILABLE", start, requested, null, null, List.of(), List.of("Bibliothèques natives OR-Tools indisponibles sur ce serveur. Aucun remplacement par une heuristique."), false);
        }
        CpModel model = new CpModel();
        var candidates = new ArrayList<Candidate>();
        var diagnostics = preflight(p);
        var resourceUse = new HashMap<String, List<BoolVar>>();
        var campusUse = new HashMap<String, BoolVar>();
        var teacherDays = new HashMap<String, List<BoolVar>>();
        int serial = 0;
        for (var requirement : p.requirements()) {
            var teacher = p.teachers().stream().filter(t -> t.id().equals(requirement.teacherId())).findFirst().orElseThrow();
            var group = p.groups().stream().filter(g -> g.id().equals(requirement.groupId())).findFirst().orElseThrow();
            var element = p.elements().stream().filter(e -> e.id().equals(requirement.elementId())).findFirst().orElseThrow();
            int remaining = requirement.weeklySessions() - (int) TimetableSolutionValidator.matching(p.existing(), requirement);
            IntVar previousPosition = null;
            for (int occurrence = 0; occurrence < remaining; occurrence++) {
                var choices = new ArrayList<BoolVar>(); var position = LinearExpr.newBuilder();
                int ordinal = 0;
                for (String day : p.calendar().days()) for (var slot : p.calendar().slots()) for (var room : p.rooms()) {
                    ordinal++;
                    if (!compatible(p, requirement, teacher, group, element, room, day, slot.code())) continue;
                    var decision = model.newBoolVar("x_" + serial++);
                    choices.add(decision); position.addTerm(decision, ordinal);
                    var assignment = new Assignment(requirement.id(), group.id(), element.id(), teacher.id(), room.id(), day, slot.code());
                    candidates.add(new Candidate(decision, assignment));
                    add(resourceUse, "r:" + room.id() + ":" + day + ":" + slot.code(), decision);
                    add(resourceUse, "t:" + teacher.id() + ":" + day + ":" + slot.code(), decision);
                    add(resourceUse, "g:" + group.id() + ":" + day + ":" + slot.code(), decision);
                    String campusKey = teacher.id() + ":" + day + ":" + room.campusId();
                    var campus = campusUse.get(campusKey);
                    if (campus == null) {
                        campus = model.newBoolVar("campus_" + campusUse.size()); campusUse.put(campusKey, campus);
                        add(teacherDays, teacher.id() + ":" + day, campus);
                    }
                    model.addImplication(decision, campus);
                    if (serial > 120_000) return result("INPUT_INVALID", start, requested, null, null, List.of(), List.of("Trop de combinaisons candidates pour la résolution synchrone ; réduisez les besoins ou les ressources."), false);
                }
                // Empty domain deliberately makes the actual CP-SAT model infeasible.
                model.addExactlyOne(choices.toArray(new Literal[0]));
                if (choices.isEmpty()) diagnostics.add("Besoin " + requirement.id() + " : aucune combinaison salle/créneau compatible (capacité, équipement, disponibilité ou occupation existante).");
                var currentPosition = model.newIntVar(0, Math.max(1, ordinal), "position_" + requirement.id() + "_" + occurrence);
                model.addEquality(currentPosition, position);
                if (previousPosition != null) model.addLessThan(previousPosition, currentPosition);
                previousPosition = currentPosition;
            }
        }
        resourceUse.values().forEach(vars -> model.addAtMostOne(vars.toArray(new Literal[0])));
        teacherDays.values().forEach(vars -> model.addAtMostOne(vars.toArray(new Literal[0])));
        for (var teacher : p.teachers()) {
            var load = LinearExpr.newBuilder();
            candidates.stream().filter(c -> c.assignment.teacherId().equals(teacher.id())).forEach(c -> load.addTerm(c.decision, p.calendar().slotMinutes()));
            long fixedMinutes = p.existing().stream().filter(a -> a.teacherId().equals(teacher.id())).count() * p.calendar().slotMinutes();
            model.addLessOrEqual(load, teacher.weeklyHours() * 60L - fixedMinutes);
        }
        var holes = new ArrayList<BoolVar>();
        for (var group : p.groups()) for (String day : p.calendar().days()) {
            var occupied = new ArrayList<BoolVar>();
            for (var slot : p.calendar().slots()) {
                var occ = model.newBoolVar("occupied_" + group.id() + "_" + day + "_" + slot.code()); occupied.add(occ);
                boolean fixed = p.existing().stream().anyMatch(a -> a.groupId().equals(group.id()) && a.day().equals(day) && a.slot().equals(slot.code()));
                if (fixed) model.addEquality(occ, 1);
                else model.addEquality(occ, sum(resourceUse.getOrDefault("g:" + group.id() + ":" + day + ":" + slot.code(), List.of())));
            }
            for (int i = 1; i < occupied.size() - 1; i++) {
                var before = or(model, occupied.subList(0, i), "before_" + holes.size());
                var after = or(model, occupied.subList(i + 1, occupied.size()), "after_" + holes.size());
                var hole = model.newBoolVar("hole_" + holes.size()); holes.add(hole);
                model.addBoolAnd(new Literal[]{before, after, occupied.get(i).not()}).onlyEnforceIf(hole);
                model.addBoolOr(new Literal[]{before.not(), after.not(), occupied.get(i), hole});
            }
        }
        model.minimize(sum(holes));
        CpSolver solver = new CpSolver();
        solver.getParameters().setMaxTimeInSeconds(Math.min(30, Math.max(0.01, seconds))).setNumSearchWorkers(2).setRandomSeed(42);
        CpSolverStatus status = solver.solve(model);
        boolean feasible = status == CpSolverStatus.OPTIMAL || status == CpSolverStatus.FEASIBLE;
        var assignments = feasible ? candidates.stream().filter(c -> solver.booleanValue(c.decision)).map(Candidate::assignment).toList() : List.<Assignment>of();
        if (!feasible && diagnostics.isEmpty()) diagnostics.add(status == CpSolverStatus.INFEASIBLE ? "CP-SAT prouve que ces contraintes combinées sont incompatibles. La cause exacte n’est pas isolée." : "Aucune solution exploitable avant la limite de calcul. Aucun planning enregistré.");
        if (feasible) {
            var violations = validator.validate(p, assignments, true);
            if (!violations.isEmpty() || validator.groupHoles(p, assignments) != Math.round(solver.objectiveValue())) {
                diagnostics.addAll(violations); diagnostics.add("La validation indépendante a refusé le résultat. Aucun planning enregistré.");
                return result("VALIDATION_FAILED", start, requested, null, null, List.of(), diagnostics, false);
            }
        }
        return result(status.name(), start, requested, feasible ? solver.objectiveValue() : null, feasible ? solver.bestObjectiveBound() : null, assignments, diagnostics, feasible);
    }
    private static boolean compatible(TimetableProblem p, Requirement r, Teacher t, Group g, Element e, Room room, String day, String slot) {
        if (!room.available() || !t.active() || !room.campusId().equals(g.campusId()) || room.capacity() < g.size()) return false;
        if (!e.roomType().equals("STANDARD") && !e.roomType().equals(room.type())) return false;
        if (e.roomType().equals("LI_PC") && room.pcs() < g.size()) return false;
        if ((t.visiting() || !t.availability().isEmpty()) && t.availability().stream().noneMatch(a -> a.jour().equals(day) && a.creneaux().contains(slot))) return false;
        if (!p.qualifications().contains(new Qualification(t.id(), e.moduleId()))) return false;
        for (var fixed : p.existing()) if (fixed.day().equals(day)) {
            if (fixed.teacherId().equals(t.id())) {
                String fixedCampus = p.rooms().stream().filter(x -> x.id().equals(fixed.roomId())).findFirst().orElseThrow().campusId();
                if (!fixedCampus.equals(room.campusId())) return false;
            }
            if (fixed.slot().equals(slot) && (fixed.groupId().equals(g.id()) || fixed.teacherId().equals(t.id()) || fixed.roomId().equals(room.id()))) return false;
        }
        return true;
    }
    private static ArrayList<String> preflight(TimetableProblem p) {
        var messages = new ArrayList<String>();
        for (var g : p.groups()) {
            long demand = p.existing().stream().filter(a -> a.groupId().equals(g.id())).count();
            for (var r : p.requirements()) if (r.groupId().equals(g.id())) demand += Math.max(0, r.weeklySessions() - TimetableSolutionValidator.matching(p.existing(), r));
            if (demand > p.calendar().days().size() * p.calendar().slots().size()) messages.add("Groupe " + g.id() + " : le nombre de séances dépasse la capacité horaire hebdomadaire.");
            if (p.requirements().stream().noneMatch(r -> r.groupId().equals(g.id()))) messages.add("Groupe " + g.id() + " : aucun besoin renseigné ; aucun enseignement supplémentaire ne sera inventé.");
        }
        for (var t : p.teachers()) {
            long demand = p.existing().stream().filter(a -> a.teacherId().equals(t.id())).count();
            for (var r : p.requirements()) if (r.teacherId().equals(t.id())) demand += Math.max(0, r.weeklySessions() - TimetableSolutionValidator.matching(p.existing(), r));
            long available = p.calendar().days().stream().flatMap(day -> p.calendar().slots().stream().filter(s -> (!t.visiting() && t.availability().isEmpty()) || t.availability().stream().anyMatch(a -> a.jour().equals(day) && a.creneaux().contains(s.code())))).count();
            if (demand > available) messages.add("Enseignant " + t.id() + " : disponibilités insuffisantes pour le nombre de séances demandé.");
            if (demand * p.calendar().slotMinutes() > t.weeklyHours() * 60L) messages.add("Enseignant " + t.id() + " : le besoin dépasse sa charge contractuelle hebdomadaire.");
            if (demand > 0 && !t.visiting() && t.availability().isEmpty()) messages.add("Enseignant permanent " + t.id() + " : sans restriction de disponibilité renseignée, tous les créneaux ouverts sont autorisés.");
        }
        for (var r : p.requirements()) {
            var g = p.groups().stream().filter(x -> x.id().equals(r.groupId())).findFirst().orElseThrow();
            var e = p.elements().stream().filter(x -> x.id().equals(r.elementId())).findFirst().orElseThrow();
            boolean room = p.rooms().stream().anyMatch(x -> x.available() && x.campusId().equals(g.campusId()) && x.capacity() >= g.size() && (e.roomType().equals("STANDARD") || x.type().equals(e.roomType())) && (!e.roomType().equals("LI_PC") || x.pcs() >= g.size()));
            if (!room) messages.add("Besoin " + r.id() + " : aucune salle du campus avec la capacité et les équipements requis (" + g.size() + " places, " + e.roomType() + ").");
        }
        return messages;
    }
    private static void add(Map<String,List<BoolVar>> map, String key, BoolVar v) { map.computeIfAbsent(key, ignored -> new ArrayList<>()).add(v); }
    private static LinearExpr sum(List<BoolVar> vars) { return LinearExpr.sum(vars.toArray(new IntVar[0])); }
    private static BoolVar or(CpModel m, List<BoolVar> vars, String name) {
        var value = m.newBoolVar(name);
        m.addBoolOr(vars.toArray(new Literal[0])).onlyEnforceIf(value);
        vars.forEach(v -> m.addImplication(v, value));
        return value;
    }
    private static TimetableSolveResult result(String status, long start, int requested, Double objective, Double bound, List<Assignment> assignments, List<String> diagnostics, boolean validated) {
        return new TimetableSolveResult(status, (System.nanoTime() - start) / 1e9, requested, assignments.size(), objective, bound, assignments, List.copyOf(diagnostics), validated, null, null);
    }
}
