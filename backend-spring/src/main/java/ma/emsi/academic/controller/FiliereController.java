package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.filiere.FiliereDto;
import ma.emsi.academic.service.FiliereService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/filieres")
@RequiredArgsConstructor
@Tag(name = "Filières Pédagogiques", description = "Gestion des filières d'ingénierie (IIR, GC, GI, IA)")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
public class FiliereController {

    private final FiliereService filiereService;

    @GetMapping
    @Operation(summary = "Lister les filières paginées")
    public ResponseEntity<PageResponse<FiliereDto>> getAllFilieres(
            @PageableDefault(page = 0, size = 10, sort = "code", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(filiereService.getAllFilieres(pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "Lister toutes les filières sans pagination (pour les sélecteurs de formulaire)")
    public ResponseEntity<List<FiliereDto>> getAllFilieresList() {
        return ResponseEntity.ok(filiereService.getAllFilieresList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une filière par son identifiant")
    public ResponseEntity<FiliereDto> getFiliereById(@PathVariable Long id) {
        return ResponseEntity.ok(filiereService.getFiliereById(id));
    }
}
