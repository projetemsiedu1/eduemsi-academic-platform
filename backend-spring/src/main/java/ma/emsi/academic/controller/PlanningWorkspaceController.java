package ma.emsi.academic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.planning.PlanningSnapshot;
import ma.emsi.academic.dto.planning.SaveSeanceRequest;
import ma.emsi.academic.service.PlanningService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RESPONSABLE_PLANNING')")
public class PlanningWorkspaceController {
    private final PlanningService service;
    @GetMapping("/workspace") public PlanningSnapshot workspace() { return service.snapshot(); }
    @PostMapping("/modules") @ResponseStatus(HttpStatus.CREATED)
    public java.util.Map<String, String> createModule(@Valid @RequestBody ma.emsi.academic.dto.planning.CreatePlanningModuleRequest request) { service.createModule(request); return java.util.Map.of("message", "Module et élément pédagogique créés."); }
    @PostMapping("/seances") @ResponseStatus(HttpStatus.CREATED)
    public PlanningSnapshot.SeanceData create(@Valid @RequestBody SaveSeanceRequest request) { return service.save(null, request); }
    @PutMapping("/seances/{id}") public PlanningSnapshot.SeanceData update(@PathVariable Long id, @Valid @RequestBody SaveSeanceRequest request) { return service.save(id, request); }
    @DeleteMapping("/seances/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
