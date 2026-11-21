package ma.emsi.academic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.dto.examen.*;
import ma.emsi.academic.service.ExamenService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/examens")
@RequiredArgsConstructor
@Tag(name = "Planification des Examens", description = "Gestion des épreuves d'examen, affectation des salles, surveillants et distribution des places")
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

    // -------------------------------------------------------------------------
    // DISTRIBUTION HÉTÉROGÈNE DES PLACES & TABLES D'EXAMEN
    // -------------------------------------------------------------------------

    @PostMapping("/{id}/distribuer-places")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_SCOLARITE')")
    @Operation(summary = "Générer la distribution hétérogène des étudiants (anti-triche & numéros de tables)")
    public ResponseEntity<List<ExamenAffectationDto>> distribuerPlaces(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean unSurDeux) {
        return ResponseEntity.ok(examenService.distribuerPlacesHeterogene(id, unSurDeux));
    }

    @GetMapping("/{id}/places")
    @Operation(summary = "Consulter le plan d'affectation des places et tables pour une épreuve")
    public ResponseEntity<List<ExamenAffectationDto>> getPlacesParExamen(@PathVariable Long id) {
        return ResponseEntity.ok(examenService.getPlacesParExamen(id));
    }

    // -------------------------------------------------------------------------
    // ESPACE ÉTUDIANT : CONVOCATIONS, SALLES & NUMÉROS DE TABLES
    // -------------------------------------------------------------------------

    @GetMapping("/convocations/me")
    @Operation(summary = "Consulter ses convocations d'examens officielles avec salle et numéro de place (Étudiant connecté)")
    public ResponseEntity<List<ConvocationEtudiantDto>> getMesConvocations(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "etudiant";
        return ResponseEntity.ok(examenService.getConvocationsEtudiant(username));
    }

    @GetMapping("/convocations/etudiant/{etudiantId}")
    @Operation(summary = "Consulter les convocations officielles d'un étudiant par son ID")
    public ResponseEntity<List<ConvocationEtudiantDto>> getConvocationsEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(examenService.getConvocationsEtudiantById(etudiantId));
    }

    // -------------------------------------------------------------------------
    // ESPACE ENSEIGNANT : SURVEILLANCE DES SALLES & CONTRÔLE ANTI-TRICHE
    // -------------------------------------------------------------------------

    @GetMapping("/surveillances/me")
    @Operation(summary = "Consulter ses surveillances d'examens et sessions sous son contrôle (Enseignant connecté)")
    public ResponseEntity<List<ExamenDto>> getMesSurveillances(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "professeur";
        return ResponseEntity.ok(examenService.getSurveillancesEnseignant(username));
    }

    @GetMapping("/surveillances/enseignant/{enseignantId}")
    @Operation(summary = "Consulter les surveillances d'un enseignant par son ID")
    public ResponseEntity<List<ExamenDto>> getSurveillancesEnseignant(@PathVariable Long enseignantId) {
        return ResponseEntity.ok(examenService.getSurveillancesEnseignantById(enseignantId));
    }

    @PutMapping("/affectations/{affectationId}/presence")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_SCOLARITE','PROFESSEUR_PERMANENT','PROFESSEUR_VACATAIRE')")
    @Operation(summary = "Émargement et contrôle anti-triche : pointer la présence de l'étudiant et conformité de la place")
    public ResponseEntity<ExamenAffectationDto> pointerPresence(
            @PathVariable Long affectationId,
            @RequestParam String statut) {
        return ResponseEntity.ok(examenService.updatePresenceEtudiant(affectationId, statut));
    }

    // -------------------------------------------------------------------------
    // PLANIFICATION AUTOMATIQUE AVEC CONTRAINTES DE SESSION
    // -------------------------------------------------------------------------

    @PostMapping("/auto-planifier")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','RESPONSABLE_PLANNING','RESPONSABLE_SCOLARITE')")
    @Operation(summary = "Ordonnancement automatique des examens selon les contraintes (durée, max modules/jour, décalage)")
    public ResponseEntity<List<ExamenDto>> autoPlanifierExamens(
            @Valid @RequestBody AutoPlanificationExamensRequest request) {
        return ResponseEntity.ok(examenService.autoPlanifierExamens(request));
    }
}
