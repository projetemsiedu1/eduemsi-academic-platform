package ma.emsi.academic.service.solver.global;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.planning.TimetableSolveResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.concurrent.Semaphore;

@Service @RequiredArgsConstructor
public class TimetableSolverService {
    private final TimetableProblemBuilder builder;
    private final CpSatTimetableSolver solver;
    private final TimetableProposalService proposals;
    private final Semaphore capacity = new Semaphore(1);
    @Value("${univora.timetable.max-seconds:15}") private double maxSeconds;
    public TimetableSolveResult solve(String owner) {
        if (!capacity.tryAcquire()) throw new TimetableConflictException("Une résolution est déjà en cours sur ce serveur. Réessayez dans quelques secondes.");
        try {
            var problem = builder.build(); // Short read-only transaction, released before CPU work.
            var result = solver.solve(problem, maxSeconds);
            return result.validated() && result.assignedSessions() > 0 ? proposals.store(owner, problem, result) : result;
        } finally { capacity.release(); }
    }
}
