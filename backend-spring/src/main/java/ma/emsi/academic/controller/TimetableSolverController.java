package ma.emsi.academic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.solver.*;
import ma.emsi.academic.dto.planning.TimetableSolveResult;
import ma.emsi.academic.service.solver.global.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import static ma.emsi.academic.service.solver.global.TimetableRequirementService.*;

@RestController @RequestMapping("/api/v1/planning/solver") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING')")
public class TimetableSolverController {
    private final TimetableSolverService solver;
    private final TimetableRequirementService requirements;
    private final TimetableProposalService proposals;
    private final TimetableCalendar calendar;
    @GetMapping("/calendar") public TimetableCalendar.Calendar calendar() { return calendar.definition(); }
    @GetMapping("/requirements") public Configuration configuration() { return requirements.configuration(); }
    @PostMapping("/requirements") @ResponseStatus(HttpStatus.CREATED) public TeachingRequirement create(@Valid @RequestBody RequirementInput input) { return requirements.save(null, input); }
    @PutMapping("/requirements/{id}") public TeachingRequirement update(@PathVariable Long id, @Valid @RequestBody RequirementInput input) { return requirements.save(id, input); }
    @DeleteMapping("/requirements/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { requirements.delete(id); }
    @PostMapping("/qualifications") public TeacherQualification qualify(@Valid @RequestBody QualificationInput input) { return requirements.qualify(input); }
    @DeleteMapping("/qualifications/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void unqualify(@PathVariable Long id) { requirements.unqualify(id); }
    @PostMapping("/solve") public TimetableSolveResult solve(Principal principal) { return solver.solve(principal.getName()); }
    @GetMapping("/proposals/{id}") public TimetableSolveResult proposal(@PathVariable String id, Principal p) { return proposals.get(id, p.getName()); }
    @PostMapping("/proposals/{id}/accept") public TimetableSolveResult accept(@PathVariable String id, Principal p) { return proposals.accept(id, p.getName()); }
    @PostMapping("/proposals/{id}/reject") public TimetableSolveResult reject(@PathVariable String id, Principal p) { return proposals.reject(id, p.getName()); }
}
