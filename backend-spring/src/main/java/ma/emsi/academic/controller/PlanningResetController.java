package ma.emsi.academic.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.service.PlanningResetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController @RequestMapping("/api/v1/planning/reset") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING')")
public class PlanningResetController {
    private final PlanningResetService service;
    public record ResetInput(@NotNull @Size(max=5000) List<@NotNull @Positive Long> expectedSessionIds,
            @NotNull @Pattern(regexp="VIDER", message="Saisissez VIDER pour confirmer la remise à zéro des séances.") String confirmation) {}
    @PostMapping public PlanningResetService.ResetResult reset(@Valid @RequestBody ResetInput input, Principal p) { return service.reset(input.expectedSessionIds(), p.getName()); }
}
