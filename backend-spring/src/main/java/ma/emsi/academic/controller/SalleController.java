package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.enums.TypeSalle;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.salle.CreateSalleRequest;
import ma.emsi.academic.dto.salle.SalleDto;
import ma.emsi.academic.service.SalleService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/salles")
@RequiredArgsConstructor
@Tag(name = "Salles & Infrastructure", description = "Gestion des salles de cours, laboratoires d'informatique (LI) et réseaux (LR) par campus")
@CrossOrigin(origins = "*")
public class SalleController {

    private final SalleService salleService;

    @GetMapping
    @Operation(summary = "Lister toutes les salles avec pagination et tri")
    public ResponseEntity<PageResponse<SalleDto>> getAllSalles(
            @PageableDefault(page = 0, size = 15, sort = "codeSalle", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(salleService.getAllSalles(pageable));
    }

    @GetMapping("/campus/{campusId}")
    @Operation(summary = "Lister les salles d'un campus spécifique (Targa ou Guéliz) avec pagination")
    public ResponseEntity<PageResponse<SalleDto>> getSallesByCampus(
            @PathVariable Long campusId,
            @PageableDefault(page = 0, size = 15, sort = "codeSalle", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(salleService.getSallesByCampus(campusId, pageable));
    }

    @GetMapping("/type/{typeSalle}")
    @Operation(summary = "Filtrer les salles par typologie technique (LI_PC, LR_RESEAUX, STANDARD, AMPHI)")
    public ResponseEntity<PageResponse<SalleDto>> getSallesByType(
            @PathVariable TypeSalle typeSalle,
            @PageableDefault(page = 0, size = 15) Pageable pageable) {
        return ResponseEntity.ok(salleService.getSallesByType(typeSalle, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails d'une salle par son ID")
    public ResponseEntity<SalleDto> getSalleById(@PathVariable Long id) {
        return ResponseEntity.ok(salleService.getSalleById(id));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle salle sur un campus")
    public ResponseEntity<SalleDto> createSalle(@Valid @RequestBody CreateSalleRequest request) {
        return new ResponseEntity<>(salleService.createSalle(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour les spécifications d'une salle")
    public ResponseEntity<SalleDto> updateSalle(@PathVariable Long id, @Valid @RequestBody CreateSalleRequest request) {
        return ResponseEntity.ok(salleService.updateSalle(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une salle")
    public ResponseEntity<Void> deleteSalle(@PathVariable Long id) {
        salleService.deleteSalle(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/import-excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Importer en masse un parc de salles depuis un fichier Excel (.xlsx)")
    public ResponseEntity<List<SalleDto>> importerSalles(
            @RequestParam("file") MultipartFile file,
            @RequestParam("campusId") Long campusId) throws IOException {
        List<SalleDto> importees = salleService.importerSallesFromExcel(file.getInputStream(), campusId);
        return ResponseEntity.ok(importees);
    }
}
