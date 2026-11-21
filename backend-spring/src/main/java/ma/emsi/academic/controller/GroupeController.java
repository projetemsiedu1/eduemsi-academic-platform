package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.groupe.CreateGroupeRequest;
import ma.emsi.academic.dto.groupe.GroupeDto;
import ma.emsi.academic.service.GroupeService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groupes")
@RequiredArgsConstructor
@Tag(name = "Groupes & Filières", description = "Gestion pédagogique des groupes d'étudiants avec respect de la règle du campus unique")

public class GroupeController {

    private final GroupeService groupeService;

    @GetMapping
    @Operation(summary = "Lister tous les groupes avec pagination")
    public ResponseEntity<PageResponse<GroupeDto>> getAllGroupes(
            @PageableDefault(page = 0, size = 15, sort = "codeGroupe", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(groupeService.getAllGroupes(pageable));
    }

    @GetMapping("/campus/{campusId}")
    @Operation(summary = "Lister les groupes affectés à un campus fixe donné")
    public ResponseEntity<PageResponse<GroupeDto>> getGroupesByCampus(
            @PathVariable Long campusId,
            @PageableDefault(page = 0, size = 15, sort = "anneeEtude", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(groupeService.getGroupesByCampus(campusId, pageable));
    }

    @GetMapping("/filiere/{filiereId}")
    @Operation(summary = "Lister les groupes d'une filière")
    public ResponseEntity<PageResponse<GroupeDto>> getGroupesByFiliere(
            @PathVariable Long filiereId,
            @PageableDefault(page = 0, size = 15) Pageable pageable) {
        return ResponseEntity.ok(groupeService.getGroupesByFiliere(filiereId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les informations détaillées d'un groupe")
    public ResponseEntity<GroupeDto> getGroupeById(@PathVariable Long id) {
        return ResponseEntity.ok(groupeService.getGroupeById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Créer un nouveau groupe avec assignation impérative à un campus fixe")
    public ResponseEntity<GroupeDto> createGroupe(@Valid @RequestBody CreateGroupeRequest request) {
        return new ResponseEntity<>(groupeService.createGroupe(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    public ResponseEntity<GroupeDto> updateGroupe(@PathVariable Long id, @Valid @RequestBody CreateGroupeRequest request) {
        return ResponseEntity.ok(groupeService.updateGroupe(id, request));
    }

    @PatchMapping("/{id}/effectif")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Mettre à jour l'effectif réel d'un groupe pour recalcul de capacité des salles")
    public ResponseEntity<GroupeDto> updateEffectif(@PathVariable Long id, @RequestParam int newEffectif) {
        return ResponseEntity.ok(groupeService.updateEffectif(id, newEffectif));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_FILIERE')")
    @Operation(summary = "Supprimer un groupe")
    public ResponseEntity<Void> deleteGroupe(@PathVariable Long id) {
        groupeService.deleteGroupe(id);
        return ResponseEntity.noContent().build();
    }
}
