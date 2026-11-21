package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.entity.Module;
import ma.emsi.academic.dto.examen.CreateExamenRequest;
import ma.emsi.academic.dto.examen.ExamenDto;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.service.ExamenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamenServiceImpl implements ExamenService {

    private final ExamenRepository examenRepository;
    private final ModuleRepository moduleRepository;
    private final GroupeRepository groupeRepository;
    private final SalleRepository salleRepository;
    private final EnseignantRepository enseignantRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ExamenDto> getAllExamens() {
        return examenRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamenDto> getExamensByDate(LocalDate date) {
        return examenRepository.findByDateExamenOrderByHeureDebutAsc(date).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamenDto> getExamensByGroupe(Long groupeId) {
        return examenRepository.findByGroupeId(groupeId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ExamenDto getExamenById(Long id) {
        return examenRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve d'examen introuvable avec l'id : " + id));
    }

    @Override
    @Transactional
    public ExamenDto createExamen(CreateExamenRequest request) {
        log.info("Planification d'une nouvelle épreuve d'examen pour le groupe ID : {}, module ID : {}",
                request.getGroupeId(), request.getModuleId());

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable : " + request.getModuleId()));

        Groupe groupe = groupeRepository.findById(request.getGroupeId())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable : " + request.getGroupeId()));

        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.getSalleId()));

        Enseignant survPrinc = enseignantRepository.findById(request.getSurveillantPrincipalId())
                .orElseThrow(() -> new ResourceNotFoundException("Surveillant principal introuvable : " + request.getSurveillantPrincipalId()));

        Enseignant survSec = null;
        if (request.getSurveillantSecondaireId() != null) {
            if (request.getSurveillantSecondaireId().equals(request.getSurveillantPrincipalId())) {
                throw new BadRequestException("Le surveillant secondaire doit être distinct du surveillant principal.");
            }
            survSec = enseignantRepository.findById(request.getSurveillantSecondaireId())
                    .orElseThrow(() -> new ResourceNotFoundException("Surveillant secondaire introuvable : " + request.getSurveillantSecondaireId()));
        }

        int duree = request.getDureeMinutes() != null && request.getDureeMinutes() > 0 ? request.getDureeMinutes() : 120;
        LocalTime heureDebut = request.getHeureDebut();
        LocalTime heureFin = heureDebut.plusMinutes(duree);

        validateConstraints(null, request.getDateExamen(), heureDebut, heureFin, groupe, salle, survPrinc, survSec);

        Examen examen = Examen.builder()
                .module(module)
                .groupe(groupe)
                .salle(salle)
                .surveillantPrincipal(survPrinc)
                .surveillantSecondaire(survSec)
                .dateExamen(request.getDateExamen())
                .heureDebut(heureDebut)
                .heureFin(heureFin)
                .dureeMinutes(duree)
                .session(request.getSession())
                .consignes(request.getConsignes())
                .build();

        Examen saved = examenRepository.save(examen);
        log.info("Épreuve d'examen planifiée avec succès, ID : {}", saved.getId());
        return toDto(saved);
    }

    @Override
    @Transactional
    public ExamenDto updateExamen(Long id, CreateExamenRequest request) {
        Examen examen = examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Épreuve introuvable : " + id));

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable : " + request.getModuleId()));
        Groupe groupe = groupeRepository.findById(request.getGroupeId())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable : " + request.getGroupeId()));
        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.getSalleId()));
        Enseignant survPrinc = enseignantRepository.findById(request.getSurveillantPrincipalId())
                .orElseThrow(() -> new ResourceNotFoundException("Surveillant principal introuvable : " + request.getSurveillantPrincipalId()));

        Enseignant survSec = null;
        if (request.getSurveillantSecondaireId() != null) {
            survSec = enseignantRepository.findById(request.getSurveillantSecondaireId())
                    .orElseThrow(() -> new ResourceNotFoundException("Surveillant secondaire introuvable : " + request.getSurveillantSecondaireId()));
        }

        int duree = request.getDureeMinutes() != null && request.getDureeMinutes() > 0 ? request.getDureeMinutes() : 120;
        LocalTime heureDebut = request.getHeureDebut();
        LocalTime heureFin = heureDebut.plusMinutes(duree);

        validateConstraints(id, request.getDateExamen(), heureDebut, heureFin, groupe, salle, survPrinc, survSec);

        examen.setModule(module);
        examen.setGroupe(groupe);
        examen.setSalle(salle);
        examen.setSurveillantPrincipal(survPrinc);
        examen.setSurveillantSecondaire(survSec);
        examen.setDateExamen(request.getDateExamen());
        examen.setHeureDebut(heureDebut);
        examen.setHeureFin(heureFin);
        examen.setDureeMinutes(duree);
        examen.setSession(request.getSession());
        examen.setConsignes(request.getConsignes());

        return toDto(examenRepository.save(examen));
    }

    @Override
    @Transactional
    public void deleteExamen(Long id) {
        if (!examenRepository.existsById(id)) {
            throw new ResourceNotFoundException("Épreuve introuvable avec l'id : " + id);
        }
        examenRepository.deleteById(id);
        log.info("Épreuve d'examen ID : {} supprimée.", id);
    }

    private void validateConstraints(Long currentId, LocalDate date, LocalTime debut, LocalTime fin,
                                     Groupe groupe, Salle salle, Enseignant survPrinc, Enseignant survSec) {
        // 1. Capacité salle
        if (salle.getCapacite() < groupe.getEffectif()) {
            throw new BadRequestException("Capacité de la salle insuffisante : salle " + salle.getCodeSalle() +
                    " (" + salle.getCapacite() + " places) pour un groupe de " + groupe.getEffectif() + " étudiants.");
        }

        // 2. Conflit de salle
        List<Examen> salleConflicts = examenRepository.findSalleConflicts(date, debut, fin, salle.getId()).stream()
                .filter(e -> !Objects.equals(e.getId(), currentId))
                .toList();
        if (!salleConflicts.isEmpty()) {
            throw new BadRequestException("Conflit de salle : la salle " + salle.getCodeSalle() +
                    " est déjà réservée pour un examen sur cette plage horaire.");
        }

        // 3. Conflit de groupe
        List<Examen> groupeConflicts = examenRepository.findGroupeConflicts(date, debut, fin, groupe.getId()).stream()
                .filter(e -> !Objects.equals(e.getId(), currentId))
                .toList();
        if (!groupeConflicts.isEmpty()) {
            throw new BadRequestException("Conflit étudiant : le groupe " + groupe.getCodeGroupe() +
                    " a déjà un examen programmé sur cette plage horaire.");
        }

        // 4. Conflit surveillant principal
        List<Examen> survPrincConflicts = examenRepository.findSurveillantConflicts(date, debut, fin, survPrinc.getId()).stream()
                .filter(e -> !Objects.equals(e.getId(), currentId))
                .toList();
        if (!survPrincConflicts.isEmpty()) {
            throw new BadRequestException("Conflit de surveillance : l'enseignant " + survPrinc.getNom() + " " + survPrinc.getPrenom() +
                    " surveille déjà un autre examen sur ce créneau.");
        }

        // 5. Conflit surveillant secondaire
        if (survSec != null) {
            List<Examen> survSecConflicts = examenRepository.findSurveillantConflicts(date, debut, fin, survSec.getId()).stream()
                    .filter(e -> !Objects.equals(e.getId(), currentId))
                    .toList();
            if (!survSecConflicts.isEmpty()) {
                throw new BadRequestException("Conflit de surveillance : l'enseignant " + survSec.getNom() + " " + survSec.getPrenom() +
                        " surveille déjà un autre examen sur ce créneau.");
            }
        }
    }

    private ExamenDto toDto(Examen e) {
        return ExamenDto.builder()
                .id(e.getId())
                .moduleId(e.getModule().getId())
                .codeModule(e.getModule().getCodeModule())
                .intituleModule(e.getModule().getIntitule())
                .groupeId(e.getGroupe().getId())
                .codeGroupe(e.getGroupe().getCodeGroupe())
                .effectifGroupe(e.getGroupe().getEffectif())
                .salleId(e.getSalle().getId())
                .codeSalle(e.getSalle().getCodeSalle())
                .capaciteSalle(e.getSalle().getCapacite())
                .campusNom(e.getSalle().getCampus() != null ? e.getSalle().getCampus().getNom() : null)
                .surveillantPrincipalId(e.getSurveillantPrincipal().getId())
                .surveillantPrincipalNom(e.getSurveillantPrincipal().getNom() + " " + e.getSurveillantPrincipal().getPrenom())
                .surveillantSecondaireId(e.getSurveillantSecondaire() != null ? e.getSurveillantSecondaire().getId() : null)
                .surveillantSecondaireNom(e.getSurveillantSecondaire() != null ? e.getSurveillantSecondaire().getNom() + " " + e.getSurveillantSecondaire().getPrenom() : null)
                .dateExamen(e.getDateExamen())
                .heureDebut(e.getHeureDebut())
                .heureFin(e.getHeureFin())
                .dureeMinutes(e.getDureeMinutes())
                .session(e.getSession())
                .consignes(e.getConsignes())
                .build();
    }
}
