package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.enums.TypeContrat;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.enseignant.CreateEnseignantRequest;
import ma.emsi.academic.dto.enseignant.EnseignantDto;
import ma.emsi.academic.service.EnseignantService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enseignants")
@RequiredArgsConstructor
@Tag(name = "Corps Enseignant", description = "Gestion des professeurs permanents (quota 18h) et vacataires (priorité CP-SAT P1)")

@SecurityRequirement(name = "bearerAuth")
public class EnseignantController {

    private final EnseignantService enseignantService;

    @GetMapping("/me")
    @Operation(summary = "Consulter le profil complet de l'enseignant connecté")
    public ResponseEntity<EnseignantDto> getMonProfil(org.springframework.security.core.Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "enseignant";
        return ResponseEntity.ok(enseignantService.getMonProfil(username));
    }

    @GetMapping("/me/emploi")
    @Operation(summary = "Consulter l'emploi du temps officiel de l'enseignant connecté (tous ses cours et TD/TP)")
    public ResponseEntity<List<ma.emsi.academic.dto.seance.SeanceDetailsDto>> getMonEmploiDuTemps(org.springframework.security.core.Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "enseignant";
        return ResponseEntity.ok(enseignantService.getMonEmploiDuTemps(username));
    }

    @GetMapping
    @Operation(summary = "Lister les enseignants avec pagination et filtre optionnel par statut (PERMANENT, VACATAIRE)")
    public ResponseEntity<PageResponse<EnseignantDto>> getAllEnseignants(
            @RequestParam(required = false) TypeContrat typeContrat,
            @PageableDefault(page = 0, size = 15, sort = "nom", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(enseignantService.getAllEnseignants(typeContrat, pageable));
    }

    @GetMapping("/vacataires")
    @Operation(summary = "Lister tous les professeurs vacataires (P1 planning)")
    public ResponseEntity<List<EnseignantDto>> getVacataires() {
        return ResponseEntity.ok(enseignantService.getEnseignantsByContrat(TypeContrat.VACATAIRE));
    }

    @GetMapping("/permanents")
    @Operation(summary = "Lister tous les professeurs permanents (quota 18h)")
    public ResponseEntity<List<EnseignantDto>> getPermanents() {
        return ResponseEntity.ok(enseignantService.getEnseignantsByContrat(TypeContrat.PERMANENT));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le profil et le volume horaire d'un enseignant")
    public ResponseEntity<EnseignantDto> getEnseignantById(@PathVariable Long id) {
        return ResponseEntity.ok(enseignantService.getEnseignantById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Ajouter un nouvel enseignant (Permanent ou Vacataire)")
    public ResponseEntity<EnseignantDto> createEnseignant(@Valid @RequestBody CreateEnseignantRequest request) {
        return new ResponseEntity<>(enseignantService.createEnseignant(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Mettre à jour les informations d'un enseignant")
    public ResponseEntity<EnseignantDto> updateEnseignant(@PathVariable Long id, @Valid @RequestBody CreateEnseignantRequest request) {
        return ResponseEntity.ok(enseignantService.updateEnseignant(id, request));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Supprimer un enseignant (si aucune séance de cours n'est affectée)")
    public ResponseEntity<Void> deleteEnseignant(@PathVariable Long id) {
        enseignantService.deleteEnseignant(id);
        return ResponseEntity.noContent().build();
    }
}
