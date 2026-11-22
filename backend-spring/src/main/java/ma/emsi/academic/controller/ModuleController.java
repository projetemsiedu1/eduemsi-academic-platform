package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.module.CreateModuleRequest;
import ma.emsi.academic.dto.module.ModuleDto;
import ma.emsi.academic.service.ModuleService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/modules")
@RequiredArgsConstructor
@Tag(name = "Gestion des Modules & Cours", description = "CRUD complet du catalogue des modules d'enseignement et éléments de module")
@SecurityRequirement(name = "bearerAuth")
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    @Operation(summary = "Lister les modules avec pagination et filtre par filière")
    public ResponseEntity<PageResponse<ModuleDto>> getAllModules(
            @RequestParam(required = false) Long filiereId,
            @PageableDefault(page = 0, size = 20, sort = "codeModule", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(moduleService.getAllModules(filiereId, pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "Lister tous les modules sans pagination (pour listes déroulantes)")
    public ResponseEntity<List<ModuleDto>> getAllModulesList() {
        return ResponseEntity.ok(moduleService.getAllModulesList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le détail d'un module et ses éléments pédagogiques")
    public ResponseEntity<ModuleDto> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    @GetMapping("/filiere/{filiereId}")
    @Operation(summary = "Lister tous les modules d'une filière donnée")
    public ResponseEntity<List<ModuleDto>> getModulesByFiliere(@PathVariable Long filiereId) {
        return ResponseEntity.ok(moduleService.getModulesByFiliere(filiereId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Créer un nouveau module d'enseignement")
    public ResponseEntity<ModuleDto> createModule(@Valid @RequestBody CreateModuleRequest request) {
        return new ResponseEntity<>(moduleService.createModule(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Mettre à jour un module existant")
    public ResponseEntity<ModuleDto> updateModule(@PathVariable Long id, @Valid @RequestBody CreateModuleRequest request) {
        return ResponseEntity.ok(moduleService.updateModule(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING')")
    @Operation(summary = "Supprimer un module du catalogue")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
