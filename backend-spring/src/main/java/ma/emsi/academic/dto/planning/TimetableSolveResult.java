package ma.emsi.academic.dto.planning;

import ma.emsi.academic.service.solver.global.TimetableProblem.Assignment;
import java.util.List;

public record TimetableSolveResult(String status, double wallTimeSeconds, int requestedSessions, int assignedSessions,
        Double objectiveValue, Double bestObjectiveBound, List<Assignment> assignments, List<String> diagnostics,
        boolean validated, String proposalId, String proposalState) {
    public TimetableSolveResult proposal(String id, String state) {
        return new TimetableSolveResult(status, wallTimeSeconds, requestedSessions, assignedSessions, objectiveValue,
                bestObjectiveBound, assignments, diagnostics, validated, id, state);
    }
}
