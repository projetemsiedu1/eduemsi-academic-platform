package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.campus.CampusDto;
import ma.emsi.academic.dto.campus.CreateCampusRequest;
import ma.emsi.academic.service.CampusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campuses")
@RequiredArgsConstructor
@Tag(name = "Gestion des Campus Universitaires", description = "CRUD des sites et campus EMSI (Marrakech Centre, Guéliz, etc.)")
@SecurityRequirement(name = "bearerAuth")
public class CampusController {

    private final CampusService campusService;

    @GetMapping
    @Operation(summary = "Lister tous les campus EMSI avec nombre de salles et de groupes")
    public ResponseEntity<List<CampusDto>> getAllCampuses() {
        return ResponseEntity.ok(campusService.getAllCampuses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter les informations d'un campus spécifique")
    public ResponseEntity<CampusDto> getCampusById(@PathVariable Long id) {
        return ResponseEntity.ok(campusService.getCampusById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(summary = "Créer un nouveau campus")
    public ResponseEntity<CampusDto> createCampus(@Valid @RequestBody CreateCampusRequest request) {
        return new ResponseEntity<>(campusService.createCampus(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(summary = "Mettre à jour un campus")
    public ResponseEntity<CampusDto> updateCampus(@PathVariable Long id, @Valid @RequestBody CreateCampusRequest request) {
        return ResponseEntity.ok(campusService.updateCampus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    @Operation(summary = "Supprimer un campus")
    public ResponseEntity<Void> deleteCampus(@PathVariable Long id) {
        campusService.deleteCampus(id);
        return ResponseEntity.noContent().build();
    }
}
