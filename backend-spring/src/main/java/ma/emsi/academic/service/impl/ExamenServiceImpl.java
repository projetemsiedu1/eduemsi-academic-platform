package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.entity.Module;
import ma.emsi.academic.dto.examen.*;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.service.ExamenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamenServiceImpl implements ExamenService {

    private final ExamenRepository examenRepository;
    private final ModuleRepository moduleRepository;
    private final GroupeRepository groupeRepository;
    private final SalleRepository salleRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final ExamenAffectationRepository examenAffectationRepository;
    private final UtilisateurRepository utilisateurRepository;

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

        // Distribution automatique des places pour les étudiants du groupe
        try {
            distribuerPlacesHeterogene(saved.getId(), true);
        } catch (Exception ex) {
            log.warn("Distribution initiale des places non effectuée : {}", ex.getMessage());
        }

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
        examenAffectationRepository.deleteByExamenId(id);
        examenAffectationRepository.flush();
        examenRepository.deleteById(id);
        log.info("Épreuve d'examen ID : {} supprimée.", id);
    }

    @Override
    @Transactional
    public List<ExamenAffectationDto> distribuerPlacesHeterogene(Long examenId, boolean unSurDeux) {
        Examen examen = examenRepository.findById(examenId)
                .orElseThrow(() -> new ResourceNotFoundException("Examen introuvable : " + examenId));

        Salle salle = examen.getSalle();
        Groupe groupe = examen.getGroupe();

        List<Etudiant> etudiants = etudiantRepository.findByGroupeId(groupe.getId());
        if (etudiants.isEmpty()) {
            log.info("Aucun étudiant trouvé pour le groupe : {}", groupe.getCodeGroupe());
            return List.of();
        }

        // Supprimer les affectations précédentes pour cet examen
        examenAffectationRepository.deleteByExamenId(examenId);
        examenAffectationRepository.flush();

        List<Etudiant> candidats = new ArrayList<>();
        List<Etudiant> radies = new ArrayList<>();

        for (Etudiant e : etudiants) {
            if (Boolean.TRUE.equals(e.getEstRadieExamen())) {
                radies.add(e);
            } else {
                candidats.add(e);
            }
        }

        // Validation de capacité
        int capaciteDisponible = salle.getCapacite();
        int pas = unSurDeux ? 2 : 1;
        int placesRequises = unSurDeux ? ((candidats.size() - 1) * pas + 1) : candidats.size();

        if (placesRequises > capaciteDisponible) {
            log.warn("Capacité insuffisante pour espacement 1 sur 2 dans la salle {}. Passage au pas compact (1 place sur 1).", salle.getCodeSalle());
            pas = 1;
            placesRequises = candidats.size();
            if (placesRequises > capaciteDisponible) {
                throw new BadRequestException("La salle " + salle.getCodeSalle() + " (" + capaciteDisponible +
                        " places) est insuffisante pour accueillir " + candidats.size() + " candidats.");
            }
        }

        // Brassage hétérogène anti-triche :
        // Pour éviter que les étudiants proches dans la liste ou inscrits consécutivement soient assis côte à côte,
        // on effectue un entrelacement systématique entre la première moitié et la seconde moitié de la cohorte.
        List<Etudiant> heterogene = new ArrayList<>(candidats.size());
        if (candidats.size() <= 2) {
            heterogene.addAll(candidats);
        } else {
            int mid = (candidats.size() + 1) / 2;
            for (int i = 0; i < mid; i++) {
                heterogene.add(candidats.get(i));
                if (i + mid < candidats.size()) {
                    heterogene.add(candidats.get(i + mid));
                }
            }
        }

        List<ExamenAffectation> affectations = new ArrayList<>();

        // Assigner les places
        for (int i = 0; i < heterogene.size(); i++) {
            Etudiant etudiant = heterogene.get(i);
            int numPlace = 1 + (i * pas);
            char rangee = (char) ('A' + ((numPlace - 1) / 10));
            int placeDansRangee = ((numPlace - 1) % 10) + 1;
            String codePlace = "Table N° " + numPlace + " (Rangée " + rangee + "-" + placeDansRangee + ")";

            ExamenAffectation aff = ExamenAffectation.builder()
                    .examen(examen)
                    .etudiant(etudiant)
                    .salle(salle)
                    .numeroPlace(numPlace)
                    .codePlace(codePlace)
                    .statutPresence("CONVOQUE")
                    .notifie(true)
                    .build();
            affectations.add(aff);
        }

        // Marquer les étudiants radiés (Règle des 20% d'absences)
        for (Etudiant r : radies) {
            ExamenAffectation aff = ExamenAffectation.builder()
                    .examen(examen)
                    .etudiant(r)
                    .salle(salle)
                    .numeroPlace(0)
                    .codePlace("Non affecté (Radié pour absences excessives >20%)")
                    .statutPresence("RADIE")
                    .notifie(true)
                    .build();
            affectations.add(aff);
        }

        List<ExamenAffectation> saved = examenAffectationRepository.saveAll(affectations);
        log.info("Distribution hétérogène des places terminée pour l'examen {} : {} places assignées, {} radiés.",
                examenId, heterogene.size(), radies.size());

        return saved.stream().map(this::toAffectationDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamenAffectationDto> getPlacesParExamen(Long examenId) {
        return examenAffectationRepository.findByExamenIdOrderByNumeroPlaceAsc(examenId).stream()
                .map(this::toAffectationDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConvocationEtudiantDto> getConvocationsEtudiant(String emailOuUsername) {
        // Chercher soit par email direct soit via compte utilisateur
        String targetEmail = emailOuUsername;
        Optional<Utilisateur> userOpt = utilisateurRepository.findByUsername(emailOuUsername);
        if (userOpt.isPresent()) {
            targetEmail = userOpt.get().getEmail();
        }

        List<ExamenAffectation> affectations = examenAffectationRepository.findByEtudiantEmailWithDetails(targetEmail);
        return affectations.stream().map(this::toConvocationDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConvocationEtudiantDto> getConvocationsEtudiantById(Long etudiantId) {
        List<ExamenAffectation> affectations = examenAffectationRepository.findByEtudiantIdWithDetails(etudiantId);
        return affectations.stream().map(this::toConvocationDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamenDto> getSurveillancesEnseignant(String emailOuUsername) {
        log.info("Recherche des épreuves sous surveillance pour l'enseignant : {}", emailOuUsername);
        String targetEmail = emailOuUsername;
        if (emailOuUsername != null && !emailOuUsername.contains("@")) {
            var userOpt = utilisateurRepository.findByUsername(emailOuUsername);
            if (userOpt.isPresent()) {
                targetEmail = userOpt.get().getEmail();
            }
        }

        Long enseignantId = null;
        if (targetEmail != null) {
            var ensOpt = enseignantRepository.findByEmail(targetEmail);
            if (ensOpt.isPresent()) {
                enseignantId = ensOpt.get().getId();
            }
        }

        if (enseignantId == null) {
            enseignantId = enseignantRepository.findAll().stream()
                    .filter(Enseignant::getEstActif)
                    .map(Enseignant::getId)
                    .findFirst()
                    .orElse(1L);
        }

        return examenRepository.findBySurveillantId(enseignantId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamenDto> getSurveillancesEnseignantById(Long enseignantId) {
        return examenRepository.findBySurveillantId(enseignantId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public ExamenAffectationDto updatePresenceEtudiant(Long affectationId, String statutPresence) {
        log.info("Contrôle anti-triche & émargement affectation {} : statut {}", affectationId, statutPresence);
        ExamenAffectation aff = examenAffectationRepository.findById(affectationId)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation d'examen introuvable avec l'id : " + affectationId));

        if (statutPresence != null && !statutPresence.isBlank()) {
            aff.setStatutPresence(statutPresence.trim().toUpperCase());
        }
        ExamenAffectation updated = examenAffectationRepository.save(aff);
        return toAffectationDto(updated);
    }

    @Override
    @Transactional
    public List<ExamenDto> autoPlanifierExamens(AutoPlanificationExamensRequest request) {
        log.info("Lancement de l'auto-planification des examens : début {}, {} jours, max {} mod/jour",
                request.getDateDebut(), request.getNombreJours(), request.getMaxModulesParJour());

        // 1. Définir le calendrier des jours d'examens (exclure dimanche, et samedi si demandé)
        List<LocalDate> datesSession = new ArrayList<>();
        LocalDate cur = request.getDateDebut();
        while (datesSession.size() < request.getNombreJours()) {
            DayOfWeek dow = cur.getDayOfWeek();
            boolean skip = (dow == DayOfWeek.SUNDAY) || (dow == DayOfWeek.SATURDAY && !Boolean.TRUE.equals(request.getInclureSamedi()));
            if (!skip) {
                datesSession.add(cur);
            }
            cur = cur.plusDays(1);
        }

        // Créneaux quotidiens : Matin (09h00-11h00), Après-midi (14h00-16h00)
        LocalTime matinDebut = LocalTime.of(9, 0);
        LocalTime matinFin = LocalTime.of(11, 0);
        LocalTime midiDebut = LocalTime.of(14, 0);
        LocalTime midiFin = LocalTime.of(16, 0);

        record Slot(LocalTime debut, LocalTime fin) {}
        List<Slot> slots = List.of(new Slot(matinDebut, matinFin), new Slot(midiDebut, midiFin));

        // 2. Déterminer les groupes concernés
        List<Groupe> groupes = (request.getFiliereIds() != null && !request.getFiliereIds().isEmpty())
                ? request.getFiliereIds().stream().flatMap(fId -> groupeRepository.findByFiliereId(fId).stream()).toList()
                : groupeRepository.findAll();

        List<Salle> salles = salleRepository.findAll();
        List<Enseignant> enseignants = enseignantRepository.findAll().stream().filter(Enseignant::getEstActif).toList();

        List<Examen> planifies = new ArrayList<>();

        // Map de charge quotidienne par groupe pour respecter maxModulesParJour
        Map<String, Integer> groupeDailyLoad = new HashMap<>();

        for (Groupe groupe : groupes) {
            List<Module> modules = moduleRepository.findByFiliereId(groupe.getFiliere().getId());

            for (Module module : modules) {
                // Vérifier si un examen pour ce module et ce groupe existe déjà pour cette session
                boolean exists = examenRepository.findByGroupeId(groupe.getId()).stream()
                        .anyMatch(e -> Objects.equals(e.getModule().getId(), module.getId()) && e.getSession() == request.getSession());
                if (exists) {
                    continue;
                }

                boolean scheduled = false;

                // Chercher un créneau disponible respectant toutes les contraintes
                for (LocalDate date : datesSession) {
                    if (scheduled) break;

                    String loadKey = groupe.getId() + ":" + date;
                    int dailyExams = groupeDailyLoad.getOrDefault(loadKey, 0);
                    if (dailyExams >= request.getMaxModulesParJour()) {
                        continue; // Limite max modules par jour atteinte pour ce groupe
                    }

                    for (Slot slot : slots) {
                        if (scheduled) break;

                        // Vérifier si le groupe est libre sur ce créneau
                        if (!examenRepository.findGroupeConflicts(date, slot.debut, slot.fin, groupe.getId()).isEmpty()) {
                            continue;
                        }

                        // Trouver une salle disponible avec capacité suffisante
                        Salle salleChoisie = null;
                        for (Salle s : salles) {
                            if (s.getCapacite() >= groupe.getEffectif() &&
                                    examenRepository.findSalleConflicts(date, slot.debut, slot.fin, s.getId()).isEmpty()) {
                                salleChoisie = s;
                                break;
                            }
                        }
                        if (salleChoisie == null) continue;

                        // Trouver un surveillant principal disponible
                        Enseignant surveillant = null;
                        for (Enseignant ens : enseignants) {
                            if (examenRepository.findSurveillantConflicts(date, slot.debut, slot.fin, ens.getId()).isEmpty()) {
                                surveillant = ens;
                                break;
                            }
                        }
                        if (surveillant == null) continue;

                        // Créer et enregistrer l'épreuve
                        Examen examen = Examen.builder()
                                .module(module)
                                .groupe(groupe)
                                .salle(salleChoisie)
                                .surveillantPrincipal(surveillant)
                                .dateExamen(date)
                                .heureDebut(slot.debut)
                                .heureFin(slot.fin)
                                .dureeMinutes(120)
                                .session(request.getSession())
                                .consignes("Épreuve officielle programmée par le planificateur automatique EMSI.")
                                .build();

                        Examen saved = examenRepository.save(examen);
                        planifies.add(saved);

                        // Mettre à jour la charge du groupe
                        groupeDailyLoad.put(loadKey, dailyExams + 1);

                        // Distribuer les places hétérogènes immédiatement
                        try {
                            distribuerPlacesHeterogene(saved.getId(), Boolean.TRUE.equals(request.getUnSurDeux()));
                        } catch (Exception ex) {
                            log.warn("Distribution des places après auto-planification : {}", ex.getMessage());
                        }

                        scheduled = true;
                    }
                }
            }
        }

        log.info("Auto-planification terminée : {} épreuves programmées avec succès.", planifies.size());
        return planifies.stream().map(this::toDto).toList();
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
        String campusNom = null;
        try {
            if (e.getSalle() != null && e.getSalle().getCampus() != null && org.hibernate.Hibernate.isInitialized(e.getSalle().getCampus())) {
                campusNom = e.getSalle().getCampus().getNom();
            }
        } catch (Exception ignored) {}

        return ExamenDto.builder()
                .id(e.getId())
                .moduleId(e.getModule() != null ? e.getModule().getId() : null)
                .codeModule(e.getModule() != null ? e.getModule().getCodeModule() : null)
                .intituleModule(e.getModule() != null ? e.getModule().getIntitule() : null)
                .groupeId(e.getGroupe() != null ? e.getGroupe().getId() : null)
                .codeGroupe(e.getGroupe() != null ? e.getGroupe().getCodeGroupe() : null)
                .effectifGroupe(e.getGroupe() != null ? e.getGroupe().getEffectif() : null)
                .salleId(e.getSalle() != null ? e.getSalle().getId() : null)
                .codeSalle(e.getSalle() != null ? e.getSalle().getCodeSalle() : null)
                .capaciteSalle(e.getSalle() != null ? e.getSalle().getCapacite() : null)
                .campusNom(campusNom)
                .surveillantPrincipalId(e.getSurveillantPrincipal() != null ? e.getSurveillantPrincipal().getId() : null)
                .surveillantPrincipalNom(e.getSurveillantPrincipal() != null ?
                        e.getSurveillantPrincipal().getPrenom() + " " + e.getSurveillantPrincipal().getNom() : null)
                .surveillantSecondaireId(e.getSurveillantSecondaire() != null ? e.getSurveillantSecondaire().getId() : null)
                .surveillantSecondaireNom(e.getSurveillantSecondaire() != null ?
                        e.getSurveillantSecondaire().getPrenom() + " " + e.getSurveillantSecondaire().getNom() : null)
                .dateExamen(e.getDateExamen())
                .heureDebut(e.getHeureDebut())
                .heureFin(e.getHeureFin())
                .dureeMinutes(e.getDureeMinutes())
                .session(e.getSession())
                .consignes(e.getConsignes())
                .build();
    }

    private ExamenAffectationDto toAffectationDto(ExamenAffectation aff) {
        return ExamenAffectationDto.builder()
                .id(aff.getId())
                .examenId(aff.getExamen().getId())
                .etudiantId(aff.getEtudiant().getId())
                .etudiantNom(aff.getEtudiant().getNom())
                .etudiantPrenom(aff.getEtudiant().getPrenom())
                .etudiantMatricule(aff.getEtudiant().getMatricule())
                .etudiantEmail(aff.getEtudiant().getEmail())
                .groupeCode(aff.getEtudiant().getGroupe() != null ? aff.getEtudiant().getGroupe().getCodeGroupe() : null)
                .salleId(aff.getSalle().getId())
                .salleCode(aff.getSalle().getCodeSalle())
                .numeroPlace(aff.getNumeroPlace())
                .codePlace(aff.getCodePlace())
                .statutPresence(aff.getStatutPresence())
                .notifie(aff.getNotifie())
                .estRadie(Boolean.TRUE.equals(aff.getEtudiant().getEstRadieExamen()))
                .build();
    }

    private ConvocationEtudiantDto toConvocationDto(ExamenAffectation aff) {
        Examen e = aff.getExamen();
        String campusNom = "EMSI Campus";
        try {
            if (aff.getSalle() != null && aff.getSalle().getCampus() != null && org.hibernate.Hibernate.isInitialized(aff.getSalle().getCampus())) {
                campusNom = aff.getSalle().getCampus().getNom();
            }
        } catch (Exception ignored) {}

        return ConvocationEtudiantDto.builder()
                .affectationId(aff.getId())
                .examenId(e.getId())
                .moduleCode(e.getModule() != null ? e.getModule().getCodeModule() : null)
                .moduleNom(e.getModule() != null ? e.getModule().getIntitule() : null)
                .filiereNom(e.getGroupe() != null && e.getGroupe().getFiliere() != null ? e.getGroupe().getFiliere().getLibelle() : null)
                .session(e.getSession().name())
                .dateExamen(e.getDateExamen())
                .heureDebut(e.getHeureDebut())
                .heureFin(e.getHeureFin())
                .dureeMinutes(e.getDureeMinutes())
                .salleCode(aff.getSalle().getCodeSalle())
                .campusNom(campusNom)
                .numeroPlace(aff.getNumeroPlace())
                .codePlace(aff.getCodePlace())
                .surveillantPrincipalNom(e.getSurveillantPrincipal() != null ?
                        e.getSurveillantPrincipal().getPrenom() + " " + e.getSurveillantPrincipal().getNom() : null)
                .consignes(e.getConsignes())
                .statutPresence(aff.getStatutPresence())
                .notifie(aff.getNotifie())
                .estRadie(Boolean.TRUE.equals(aff.getEtudiant().getEstRadieExamen()))
                .build();
    }
}
