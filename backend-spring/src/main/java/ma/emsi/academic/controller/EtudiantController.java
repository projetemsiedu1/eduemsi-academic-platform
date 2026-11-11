package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.etudiant.CreateEtudiantRequest;
import ma.emsi.academic.dto.etudiant.EtudiantDto;
import ma.emsi.academic.service.EtudiantService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/etudiants")
@RequiredArgsConstructor
@Tag(name = "Gestion des Étudiants", description = "CRUD complet des étudiants, affectation de groupe et statut d'assiduité")

@SecurityRequirement(name = "bearerAuth")
public class EtudiantController {

    private final EtudiantService etudiantService;

    @GetMapping
    @Operation(summary = "Lister tous les étudiants avec pagination")
    public ResponseEntity<PageResponse<EtudiantDto>> getAllEtudiants(
            @PageableDefault(page = 0, size = 15, sort = "nom", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(etudiantService.getAllEtudiants(pageable));
    }

    @GetMapping("/groupe/{groupeId}")
    @Operation(summary = "Lister les étudiants d'un groupe spécifique")
    public ResponseEntity<PageResponse<EtudiantDto>> getEtudiantsByGroupe(
            @PathVariable Long groupeId,
            @PageableDefault(page = 0, size = 35, sort = "nom", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(etudiantService.getEtudiantsByGroupe(groupeId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le profil et le dossier d'un étudiant")
    public ResponseEntity<EtudiantDto> getEtudiantById(@PathVariable Long id) {
        return ResponseEntity.ok(etudiantService.getEtudiantById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_SCOLARITE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Inscrire un nouvel étudiant dans un groupe")
    public ResponseEntity<EtudiantDto> createEtudiant(@Valid @RequestBody CreateEtudiantRequest request) {
        return new ResponseEntity<>(etudiantService.createEtudiant(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_SCOLARITE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Mettre à jour les informations d'un étudiant")
    public ResponseEntity<EtudiantDto> updateEtudiant(@PathVariable Long id, @Valid @RequestBody CreateEtudiantRequest request) {
        return ResponseEntity.ok(etudiantService.updateEtudiant(id, request));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_SCOLARITE','RESPONSABLE_FILIERE')")
    @Operation(summary = "Supprimer le dossier d'un étudiant")
    public ResponseEntity<Void> deleteEtudiant(@PathVariable Long id) {
        etudiantService.deleteEtudiant(id);
        return ResponseEntity.noContent().build();
    }
}
