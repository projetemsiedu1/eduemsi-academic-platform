package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.examen.CreateExamenRequest;
import ma.emsi.academic.dto.examen.ExamenDto;
import ma.emsi.academic.service.ExamenService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/examens")
@RequiredArgsConstructor
@Tag(name = "Planification des Examens", description = "Gestion des épreuves d'examen, affectation des salles et des surveillants sans conflit")
@SecurityRequirement(name = "bearerAuth")
public class ExamenController {

    private final ExamenService examenService;

    @GetMapping
    @Operation(summary = "Lister toutes les épreuves d'examen planifiées")
    public ResponseEntity<List<ExamenDto>> getAllExamens() {
        return ResponseEntity.ok(examenService.getAllExamens());
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Lister les examens par date spécifique")
    public ResponseEntity<List<ExamenDto>> getExamensByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(examenService.getExamensByDate(date));
    }

    @GetMapping("/groupe/{groupeId}")
    @Operation(summary = "Lister les examens programmés pour un groupe")
    public ResponseEntity<List<ExamenDto>> getExamensByGroupe(@PathVariable Long groupeId) {
        return ResponseEntity.ok(examenService.getExamensByGroupe(groupeId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le détail d'une épreuve d'examen")
    public ResponseEntity<ExamenDto> getExamenById(@PathVariable Long id) {
        return ResponseEntity.ok(examenService.getExamenById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_SCOLARITE')")
    @Operation(summary = "Planifier une nouvelle épreuve d'examen avec contrôle anti-conflit")
    public ResponseEntity<ExamenDto> createExamen(@Valid @RequestBody CreateExamenRequest request) {
        return new ResponseEntity<>(examenService.createExamen(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_SCOLARITE')")
    @Operation(summary = "Mettre à jour une épreuve d'examen existante")
    public ResponseEntity<ExamenDto> updateExamen(@PathVariable Long id, @Valid @RequestBody CreateExamenRequest request) {
        return ResponseEntity.ok(examenService.updateExamen(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_SCOLARITE')")
    @Operation(summary = "Supprimer / Annuler une épreuve d'examen")
    public ResponseEntity<Void> deleteExamen(@PathVariable Long id) {
        examenService.deleteExamen(id);
        return ResponseEntity.noContent().build();
    }
}
