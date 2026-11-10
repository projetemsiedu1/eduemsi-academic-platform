package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.absence.AbsenceDto;
import ma.emsi.academic.dto.absence.EtudiantAlerteAbsenceDto;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.service.AbsenceService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/absences")
@RequiredArgsConstructor
@Tag(name = "Scolarité & Assiduité", description = "Feuille d'émargement, suivi des absences et seuil critique d'élimination de 20% (18h max)")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
public class AbsenceController {

    private final AbsenceService absenceService;

    @GetMapping
    @Operation(summary = "Lister toutes les absences enregistrées avec pagination")
    public ResponseEntity<PageResponse<AbsenceDto>> getAllAbsences(
            @PageableDefault(page = 0, size = 15, sort = "dateSeance", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(absenceService.getAllAbsences(pageable));
    }

    @GetMapping("/etudiant/{etudiantId}")
    @Operation(summary = "Lister les absences d'un étudiant spécifique")
    public ResponseEntity<List<AbsenceDto>> getAbsencesByEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(absenceService.getAbsencesByEtudiant(etudiantId));
    }

    @GetMapping("/seuil-elimination")
    @Operation(summary = "Liste des étudiants en alerte ou ayant franchi le seuil d'élimination (20% ou 18h)")
    public ResponseEntity<List<EtudiantAlerteAbsenceDto>> getEtudiantsSeuilCritique() {
        return ResponseEntity.ok(absenceService.getEtudiantsSeuilCritique());
    }

    @PostMapping("/enregistrer")
    @Operation(summary = "Enregistrer une absence pour une séance")
    public ResponseEntity<AbsenceDto> enregistrerAbsence(@RequestBody Map<String, Object> body) {
        Long etudiantId = Long.valueOf(body.get("etudiantId").toString());
        Long seanceId = Long.valueOf(body.get("seanceId").toString());
        String motif = body.getOrDefault("motif", "").toString();
        return ResponseEntity.ok(absenceService.enregistrerAbsence(etudiantId, seanceId, motif));
    }
}
