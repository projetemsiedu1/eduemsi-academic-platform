package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.enums.OriginePfe;
import ma.emsi.academic.domain.enums.StatutPfe;
import ma.emsi.academic.dto.enseignant.EnseignantDto;
import ma.emsi.academic.dto.etudiant.EtudiantDto;
import ma.emsi.academic.dto.pfe.*;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.service.EnseignantService;
import ma.emsi.academic.service.EtudiantService;
import ma.emsi.academic.service.NotificationService;
import ma.emsi.academic.service.PfeService;
import ma.emsi.academic.service.ai.OpenRouterAiService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PfeServiceImpl implements PfeService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    private final PfeProjectRepository pfeProjectRepository;
    private final PfeJuryRepository pfeJuryRepository;
    private final PfeSujetCatalogueRepository sujetCatalogueRepository;
    private final PfeEvaluationRepository evaluationRepository;
    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;
    private final FiliereRepository filiereRepository;
    private final SalleRepository salleRepository;
    private final EtudiantService etudiantService;
    private final EnseignantService enseignantService;
    private final NotificationService notificationService;
    private final OpenRouterAiService openRouterAiService;

    @Override
    @Transactional(readOnly = true)
    public List<PfeProjectDto> listProjets(StatutPfe statut) {
        List<PfeProject> list = (statut != null)
                ? pfeProjectRepository.findByStatutWithDetails(statut)
                : pfeProjectRepository.findAllWithDetails();
        return list.stream().map(p -> mapToProjectDto(p, null)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PfeProjectDto getProjet(Long id) {
        PfeProject p = findProjectWithDetails(id);
        return mapToProjectDto(p, null);
    }

    @Override
    @Transactional
    public PfeProjectDto updateProjet(Long id, CreatePfeProjectRequest request) {
        PfeProject p = findProjectWithDetails(id);
        if (Boolean.TRUE.equals(p.getPvVerrouille())) {
            throw new BadRequestException("Impossible de modifier un projet PFE dont le PV est verrouillé.");
        }
        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable : " + request.getFiliereId()));
        p.setFiliere(filiere);
        p.setTitre(request.getTitre().trim());
        p.setResume(request.getResume().trim());
        p.setTechnologiesCles(request.getTechnologiesCles());
        p.setBinomeEtudiants(request.getBinomeEtudiants().trim());
        if (request.getStatut() != null) {
            p.setStatut(request.getStatut());
        }
        return mapToProjectDto(pfeProjectRepository.save(p), null);
    }

    @Override
    @Transactional
    public void deleteProjet(Long id) {
        PfeProject p = pfeProjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet PFE introuvable : " + id));
        PfeSujetCatalogue cat = p.getSujetCatalogue();
        pfeProjectRepository.delete(p);
        pfeProjectRepository.flush();
        if (cat != null) {
            long activeCount = pfeProjectRepository.countBySujetCatalogueIdAndStatutNot(cat.getId(), StatutPfe.REJETE);
            cat.setEstDisponible(activeCount < cat.getPlacesMax());
            sujetCatalogueRepository.save(cat);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PfeProjectDto getMonPfe(String username) {
        Etudiant etudiant = resolveEtudiant(username);
        List<PfeProject> active = pfeProjectRepository.findActiveByEtudiantId(etudiant.getId(), StatutPfe.REJETE);
        if (!active.isEmpty()) {
            return mapToProjectDto(active.get(0), null);
        }
        List<PfeProject> all = pfeProjectRepository.findAllByEtudiantIdOrderByIdDesc(etudiant.getId());
        return all.isEmpty() ? null : mapToProjectDto(all.get(0), null);
    }

    @Override
    @Transactional
    public PfeProjectDto soumettreSujetStage(String username, SoumettreSujetStageRequest request) {
        Etudiant e1 = resolveEtudiant(username);
        Etudiant e2 = validateStudentsAvailable(e1, request.getBinomeEtudiantId());

        Filiere filiere = e1.getGroupe() != null ? e1.getGroupe().getFiliere() : null;
        if (filiere == null) {
            throw new BadRequestException("Votre profil étudiant n'est rattaché à aucun groupe ou filière.");
        }

        Enseignant encadrantSouhaite = null;
        if (request.getEncadrantSouhaiteId() != null) {
            encadrantSouhaite = enseignantRepository.findById(request.getEncadrantSouhaiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable : " + request.getEncadrantSouhaiteId()));
        }

        PfeProject p = PfeProject.builder()
                .filiere(filiere)
                .titre(request.getTitre().trim())
                .resume(request.getResume().trim())
                .technologiesCles(request.getTechnologiesCles())
                .entrepriseAccueil(request.getEntrepriseAccueil().trim())
                .origine(OriginePfe.STAGE_ENTREPRISE)
                .statut(StatutPfe.SOUMIS)
                .etudiant1(e1)
                .etudiant2(e2)
                .binomeEtudiants(formatBinome(e1, e2))
                .encadrantSouhaite(encadrantSouhaite)
                .build();

        return mapToProjectDto(pfeProjectRepository.save(p), null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SujetCatalogueDto> getSujetsCatalogue(String username, String role) {
        List<PfeSujetCatalogue> sujets;
        if (role != null && role.contains("ETUDIANT")) {
            Etudiant e = resolveEtudiant(username);
            Long filiereId = e.getGroupe() != null && e.getGroupe().getFiliere() != null
                    ? e.getGroupe().getFiliere().getId() : null;
            sujets = (filiereId != null)
                    ? sujetCatalogueRepository.findByFiliereIdAndEstDisponibleTrueOrderByIdDesc(filiereId)
                    : sujetCatalogueRepository.findByEstDisponibleTrueOrderByIdDesc();
        } else {
            sujets = sujetCatalogueRepository.findAllByOrderByIdDesc();
        }
        return sujets.stream().map(this::mapSujetToDto).toList();
    }

    @Override
    @Transactional
    public PfeProjectDto choisirSujetCatalogue(String username, Long sujetId, ChoisirSujetRequest request) {
        Etudiant e1 = resolveEtudiant(username);
        Long binomeId = request != null ? request.getBinomeEtudiantId() : null;
        Etudiant e2 = validateStudentsAvailable(e1, binomeId);

        PfeSujetCatalogue sujet = sujetCatalogueRepository.findById(sujetId)
                .orElseThrow(() -> new ResourceNotFoundException("Sujet catalogue introuvable : " + sujetId));

        if (!Boolean.TRUE.equals(sujet.getEstDisponible())) {
            throw new BadRequestException("Ce sujet du catalogue n'est plus disponible.");
        }
        if (e1.getGroupe() != null && e1.getGroupe().getFiliere() != null
                && !sujet.getFiliere().getId().equals(e1.getGroupe().getFiliere().getId())) {
            throw new BadRequestException("Ce sujet appartient à la filière " + sujet.getFiliere().getCode() + ".");
        }

        PfeProject p = PfeProject.builder()
                .filiere(sujet.getFiliere())
                .sujetCatalogue(sujet)
                .origine(OriginePfe.CATALOGUE)
                .titre(sujet.getTitre())
                .resume(sujet.getDescription())
                .technologiesCles(sujet.getTechnologies())
                .entrepriseAccueil("Projet Académique EMSI")
                .encadrantSouhaite(sujet.getEnseignant())
                .etudiant1(e1)
                .etudiant2(e2)
                .binomeEtudiants(formatBinome(e1, e2))
                .statut(StatutPfe.SOUMIS)
                .build();

        PfeProject saved = pfeProjectRepository.save(p);
        long activeCount = pfeProjectRepository.countBySujetCatalogueIdAndStatutNot(sujet.getId(), StatutPfe.REJETE);
        if (activeCount >= sujet.getPlacesMax()) {
            sujet.setEstDisponible(false);
            sujetCatalogueRepository.save(sujet);
        }
        return mapToProjectDto(saved, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SujetCatalogueDto> getMesSujets(String username) {
        Enseignant prof = resolveEnseignant(username);
        return sujetCatalogueRepository.findByEnseignantIdOrderByIdDesc(prof.getId())
                .stream().map(this::mapSujetToDto).toList();
    }

    @Override
    @Transactional
    public SujetCatalogueDto createSujetCatalogue(String username, CreateSujetCatalogueRequest request) {
        Enseignant prof = resolveEnseignant(username);
        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable : " + request.getFiliereId()));

        PfeSujetCatalogue sujet = PfeSujetCatalogue.builder()
                .enseignant(prof)
                .filiere(filiere)
                .titre(request.getTitre().trim())
                .description(request.getDescription().trim())
                .technologies(request.getTechnologies())
                .placesMax(request.getPlacesMax() != null ? request.getPlacesMax() : 1)
                .estDisponible(!Boolean.FALSE.equals(request.getEstDisponible()))
                .build();

        return mapSujetToDto(sujetCatalogueRepository.save(sujet));
    }

    @Override
    @Transactional
    public SujetCatalogueDto updateSujetCatalogue(String username, boolean isPrivileged, Long id, CreateSujetCatalogueRequest request) {
        PfeSujetCatalogue sujet = sujetCatalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sujet catalogue introuvable : " + id));
        if (!isPrivileged) {
            Enseignant prof = resolveEnseignant(username);
            if (!sujet.getEnseignant().getId().equals(prof.getId())) {
                throw new BadRequestException("Vous ne pouvez modifier que vos propres sujets.");
            }
        }
        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable : " + request.getFiliereId()));

        sujet.setFiliere(filiere);
        sujet.setTitre(request.getTitre().trim());
        sujet.setDescription(request.getDescription().trim());
        sujet.setTechnologies(request.getTechnologies());
        if (request.getPlacesMax() != null) {
            sujet.setPlacesMax(request.getPlacesMax());
        }
        if (request.getEstDisponible() != null) {
            sujet.setEstDisponible(request.getEstDisponible());
        }
        return mapSujetToDto(sujetCatalogueRepository.save(sujet));
    }

    @Override
    @Transactional
    public void deleteSujetCatalogue(String username, boolean isPrivileged, Long id) {
        PfeSujetCatalogue sujet = sujetCatalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sujet catalogue introuvable : " + id));
        if (!isPrivileged) {
            Enseignant prof = resolveEnseignant(username);
            if (!sujet.getEnseignant().getId().equals(prof.getId())) {
                throw new BadRequestException("Vous ne pouvez supprimer que vos propres sujets.");
            }
        }
        if (pfeProjectRepository.countBySujetCatalogueId(id) > 0) {
            throw new BadRequestException("Ce sujet est déjà choisi par un projet PFE et ne peut pas être supprimé.");
        }
        sujetCatalogueRepository.delete(sujet);
    }

    @Override
    @Transactional
    public PfeProjectDto validerSujet(Long id, ValiderSujetRequest request) {
        PfeProject p = findProjectWithDetails(id);
        if (p.getStatut() != StatutPfe.SOUMIS) {
            throw new BadRequestException("Seuls les projets au statut SOUMIS peuvent être validés ou rejetés.");
        }
        boolean accepte = Boolean.TRUE.equals(request.getAccepte());
        p.setStatut(accepte ? StatutPfe.EN_ATTENTE_JURY : StatutPfe.REJETE);
        p.setCommentaireValidation(request.getCommentaire());

        PfeProject saved = pfeProjectRepository.save(p);
        if (!accepte && p.getSujetCatalogue() != null) {
            PfeSujetCatalogue cat = p.getSujetCatalogue();
            long activeCount = pfeProjectRepository.countBySujetCatalogueIdAndStatutNot(cat.getId(), StatutPfe.REJETE);
            cat.setEstDisponible(activeCount < cat.getPlacesMax());
            sujetCatalogueRepository.save(cat);
        }

        String titreNotif = accepte ? "Sujet PFE validé par la filière" : "Sujet PFE refusé / à revoir";
        String msgNotif = accepte
                ? "Votre sujet « " + p.getTitre() + " » est validé. En attente de désignation du jury de soutenance."
                : "Votre sujet « " + p.getTitre() + " » a été refusé. Motif : "
                  + (request.getCommentaire() != null && !request.getCommentaire().isBlank() ? request.getCommentaire() : "À préciser.");
        notifierEtudiantsProjet(p, titreNotif, msgNotif, "PFE_VALIDATION", "/timetable/student");

        return mapToProjectDto(saved, null);
    }

    @Override
    @Transactional(readOnly = true)
    public MatchJuryResponse proposerJury(Long id) {
        PfeProject p = findProjectWithDetails(id);
        List<Enseignant> actifs = enseignantRepository.findAll().stream()
                .filter(e -> !Boolean.FALSE.equals(e.getEstActif()))
                .toList();

        if (actifs.size() < 4) {
            throw new BadRequestException("Au moins 4 enseignants actifs sont requis pour constituer un jury PFE.");
        }

        Set<Long> validIds = new HashSet<>();
        List<Map<String, String>> candidats = new ArrayList<>();
        for (Enseignant e : actifs) {
            validIds.add(e.getId());
            candidats.add(Map.of(
                    "id", String.valueOf(e.getId()),
                    "nom", formatNomProf(e),
                    "grade", e.getGrade() != null ? e.getGrade() : "Docteur",
                    "specialite", e.getSpecialite() != null ? e.getSpecialite() : "Génie Logiciel",
                    "departement", "EMSI",
                    "statut", e.getTypeContrat() != null ? e.getTypeContrat().name() : "PERMANENT"
            ));
        }

        String encadrantSouhaiteNom = p.getEncadrantSouhaite() != null ? formatNomProf(p.getEncadrantSouhaite()) : "";
        MatchJuryRequest req = MatchJuryRequest.builder()
                .sujet(p.getTitre())
                .resume(p.getResume())
                .technologies(p.getTechnologiesCles())
                .filiere(p.getFiliere() != null ? p.getFiliere().getCode() : "IIR")
                .etudiant(p.getBinomeEtudiants())
                .encadrant(encadrantSouhaiteNom)
                .build();

        MatchJuryResponse response = openRouterAiService.matcherJuryPfe(req, candidats);
        if (!isValidFourMemberMatch(response, validIds)) {
            response = openRouterAiService.executerFallbackHeuristique4Membres(
                    req.getResolvedSujet(),
                    req.getResolvedResume(),
                    req.getResolvedTechnologies(),
                    encadrantSouhaiteNom,
                    candidats
            );
        }
        return response;
    }

    @Override
    @Transactional
    public PfeProjectDto planifierJury(Long id, PlanifierSoutenanceRequest request) {
        PfeProject p = findProjectWithDetails(id);
        if (Boolean.TRUE.equals(p.getPvVerrouille())) {
            throw new BadRequestException("Le PV est déjà verrouillé : impossible de modifier le jury.");
        }
        if (p.getStatut() != StatutPfe.EN_ATTENTE_JURY && p.getStatut() != StatutPfe.JURY_AFFECTE) {
            throw new BadRequestException("Le projet doit être validé avant la planification du jury.");
        }

        Set<Long> distinctIds = new HashSet<>(Arrays.asList(
                request.getEncadrantId(),
                request.getRapporteurId(),
                request.getExaminateurIaId(),
                request.getPresidentHdrId()
        ));
        if (distinctIds.size() < 4) {
            throw new BadRequestException("Règle BR-PFE-07 : les 4 membres du jury (Encadrant, Rapporteur, Examinateur IA, Président HDR) doivent être distincts.");
        }

        Enseignant encadrant = findTeacher(request.getEncadrantId());
        Enseignant rapporteur = findTeacher(request.getRapporteurId());
        Enseignant examinateur = findTeacher(request.getExaminateurIaId());
        Enseignant president = findTeacher(request.getPresidentHdrId());

        String gradePres = president.getGrade() != null ? president.getGrade().toLowerCase(Locale.ROOT) : "";
        if (!gradePres.contains("hdr") && !gradePres.contains("habilit") && !gradePres.contains("docteur")) {
            throw new BadRequestException("Le président du jury doit détenir le grade HDR, Professeur Habilité ou Docteur.");
        }

        Salle salle = null;
        if (request.getSalleSoutenanceId() != null) {
            salle = salleRepository.findById(request.getSalleSoutenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.getSalleSoutenanceId()));
        }

        LocalDateTime date = request.getDateSoutenance();
        List<PfeJury> proches = pfeJuryRepository.findSoutenancesInWindow(
                p.getId(), date.minusMinutes(120), date.plusMinutes(120));
        for (PfeJury autre : proches) {
            if (salle != null && autre.getSalleSoutenance() != null
                    && autre.getSalleSoutenance().getId().equals(salle.getId())) {
                throw new BadRequestException("Conflit de salle : " + salle.getCodeSalle() + " est déjà réservée pour une autre soutenance dans ce créneau.");
            }
            Set<Long> autresMembres = Set.of(
                    autre.getEncadrant().getId(),
                    autre.getRapporteur().getId(),
                    autre.getExaminateurIa().getId(),
                    autre.getPresidentHdr().getId()
            );
            for (Long mId : distinctIds) {
                if (autresMembres.contains(mId)) {
                    throw new BadRequestException("Conflit d'enseignant : un membre du jury participe déjà à une autre soutenance à moins de 2 heures.");
                }
            }
        }

        PfeJury jury = p.getJury() != null
                ? p.getJury()
                : pfeJuryRepository.findByPfeProjetId(p.getId()).orElseGet(PfeJury::new);
        jury.setPfeProjet(p);
        jury.setEncadrant(encadrant);
        jury.setRapporteur(rapporteur);
        jury.setExaminateurIa(examinateur);
        jury.setPresidentHdr(president);
        jury.setSalleSoutenance(salle);
        jury.setDateSoutenance(date);
        BigDecimal score = request.getScoreAffiniteIa() != null ? request.getScoreAffiniteIa() : BigDecimal.valueOf(94.50);
        if (score.compareTo(new BigDecimal("99.99")) > 0) {
            score = new BigDecimal("99.99");
        }
        jury.setScoreAffiniteIa(score);
        jury.setJustificationIa(request.getJustificationIa());

        PfeJury savedJury = pfeJuryRepository.save(jury);
        p.setJury(savedJury);
        p.setStatut(StatutPfe.JURY_AFFECTE);
        PfeProject saved = pfeProjectRepository.save(p);

        String lieu = salle != null ? salle.getCodeSalle() : "Salle à confirmer";
        String quand = date.format(DATE_FMT);
        notifierEtudiantsProjet(saved,
                "Convocation Soutenance PFE",
                "Votre soutenance « " + saved.getTitre() + " » est planifiée le " + quand + " en salle " + lieu + ".",
                "PFE_CONVOCATION",
                "/timetable/student");

        for (Enseignant membre : List.of(encadrant, rapporteur, examinateur, president)) {
            notificationService.notifierParEmail(
                    membre.getEmail(),
                    "Convocation Jury PFE",
                    "Vous êtes convoqué(e) au jury du PFE « " + saved.getTitre() + " » (" + saved.getBinomeEtudiants() + ") le " + quand + " en salle " + lieu + ".",
                    "PFE_JURY",
                    "/timetable/teacher"
            );
        }

        return mapToProjectDto(saved, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PfeProjectDto> getMesJurys(String username) {
        Enseignant prof = resolveEnseignant(username);
        List<PfeJury> jurys = pfeJuryRepository.findByMembreId(prof.getId());
        return jurys.stream()
                .map(j -> mapToProjectDto(j.getPfeProjet(), prof.getId()))
                .toList();
    }

    @Override
    @Transactional
    public EvaluationPfeDto enregistrerEvaluationMoi(Long pfeId, String username, EvaluationPfeRequest request) {
        Enseignant prof = resolveEnseignant(username);
        return enregistrerEvaluationPourEnseignant(pfeId, prof.getId(), request);
    }

    @Override
    @Transactional
    public EvaluationPfeDto enregistrerEvaluationPourEnseignant(Long pfeId, Long enseignantId, EvaluationPfeRequest request) {
        PfeProject p = findProjectWithDetails(pfeId);
        if (Boolean.TRUE.equals(p.getPvVerrouille())) {
            throw new BadRequestException("Le PV de soutenance est verrouillé : les notes ne peuvent plus être modifiées.");
        }
        PfeJury jury = p.getJury();
        if (jury == null) {
            throw new BadRequestException("Aucun jury n'est encore affecté à ce PFE.");
        }
        Enseignant prof = findTeacher(enseignantId);
        String roleJury = resolveRoleInJury(jury, prof.getId());
        if (roleJury == null) {
            throw new BadRequestException("Cet enseignant ne fait pas partie du jury de ce PFE.");
        }

        BigDecimal total = request.getNoteTechnique()
                .add(request.getNoteRapport())
                .add(request.getNoteDemo())
                .add(request.getNoteReponses())
                .setScale(2, RoundingMode.HALF_UP);

        PfeEvaluation eval = evaluationRepository.findByPfeProjetIdAndEvaluateurId(pfeId, prof.getId())
                .orElse(PfeEvaluation.builder().pfeProjet(p).evaluateur(prof).build());

        eval.setRoleJury(roleJury);
        eval.setNoteTechnique(request.getNoteTechnique().setScale(2, RoundingMode.HALF_UP));
        eval.setNoteRapport(request.getNoteRapport().setScale(2, RoundingMode.HALF_UP));
        eval.setNoteDemo(request.getNoteDemo().setScale(2, RoundingMode.HALF_UP));
        eval.setNoteReponses(request.getNoteReponses().setScale(2, RoundingMode.HALF_UP));
        eval.setTotal(total);
        eval.setCommentaire(request.getCommentaire());

        return mapEvalToDto(evaluationRepository.save(eval));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationPfeDto> getEvaluations(Long pfeId) {
        if (!pfeProjectRepository.existsById(pfeId)) {
            throw new ResourceNotFoundException("Projet PFE introuvable : " + pfeId);
        }
        return evaluationRepository.findByPfeProjetIdOrderByIdAsc(pfeId)
                .stream().map(this::mapEvalToDto).toList();
    }

    @Override
    @Transactional
    public PvSoutenanceDto verrouillerPv(Long pfeId, String username, boolean isSuperAdmin) {
        PfeProject p = findProjectWithDetails(pfeId);
        if (Boolean.TRUE.equals(p.getPvVerrouille())) {
            throw new BadRequestException("Le PV de soutenance est déjà verrouillé.");
        }
        PfeJury jury = p.getJury();
        if (jury == null) {
            throw new BadRequestException("Aucun jury n'est affecté à ce PFE.");
        }
        if (!isSuperAdmin) {
            Enseignant caller = resolveEnseignant(username);
            if (!jury.getPresidentHdr().getId().equals(caller.getId())) {
                throw new BadRequestException("Seul le Président du Jury HDR (ou un Super Admin) peut verrouiller le PV.");
            }
        }

        List<PfeEvaluation> evals = evaluationRepository.findByPfeProjetIdOrderByIdAsc(pfeId);
        if (evals.size() < 4) {
            throw new BadRequestException("Les 4 membres du jury doivent saisir leur grille d'évaluation avant le verrouillage (" + evals.size() + "/4 saisies).");
        }

        BigDecimal somme = evals.stream()
                .map(PfeEvaluation::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal noteFinale = somme.divide(BigDecimal.valueOf(evals.size()), 2, RoundingMode.HALF_UP);
        String mention = computeMention(noteFinale);

        p.setNoteFinale(noteFinale);
        p.setMention(mention);
        p.setStatut(noteFinale.compareTo(BigDecimal.TEN) >= 0 ? StatutPfe.SOUTENU : StatutPfe.AJOURNE);
        p.setPvVerrouille(true);
        p.setDateVerrouillage(LocalDateTime.now());
        PfeProject saved = pfeProjectRepository.save(p);

        notifierEtudiantsProjet(saved,
                "Résultat & PV de Soutenance PFE",
                "Votre PV de soutenance « " + saved.getTitre() + " » est validé : Note " + noteFinale + "/20 — Mention : " + mention + ".",
                "PFE_RESULTAT",
                "/timetable/pfe/pv/" + saved.getId());

        return buildPvDto(saved, evals);
    }

    @Override
    @Transactional(readOnly = true)
    public PvSoutenanceDto getPv(Long pfeId) {
        PfeProject p = findProjectWithDetails(pfeId);
        List<PfeEvaluation> evals = evaluationRepository.findByPfeProjetIdOrderByIdAsc(pfeId);
        return buildPvDto(p, evals);
    }

    // ==================== HELPERS ====================

    private PfeProject findProjectWithDetails(Long id) {
        return pfeProjectRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet PFE introuvable : " + id));
    }

    private Etudiant resolveEtudiant(String username) {
        EtudiantDto profil = etudiantService.getMonProfil(username);
        return etudiantRepository.findById(profil.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable : " + profil.getId()));
    }

    private Enseignant resolveEnseignant(String username) {
        EnseignantDto profil = enseignantService.getMonProfil(username);
        return enseignantRepository.findById(profil.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable : " + profil.getId()));
    }

    private Enseignant findTeacher(Long id) {
        return enseignantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable : " + id));
    }

    private Etudiant validateStudentsAvailable(Etudiant e1, Long binomeEtudiantId) {
        if (!pfeProjectRepository.findActiveByEtudiantId(e1.getId(), StatutPfe.REJETE).isEmpty()) {
            throw new BadRequestException("Vous avez déjà un projet PFE actif.");
        }
        if (binomeEtudiantId == null) {
            return null;
        }
        if (binomeEtudiantId.equals(e1.getId())) {
            throw new BadRequestException("Vous ne pouvez pas vous sélectionner vous-même comme binôme.");
        }
        Etudiant e2 = etudiantRepository.findById(binomeEtudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Binôme étudiant introuvable : " + binomeEtudiantId));
        if (e1.getGroupe() == null || e2.getGroupe() == null || !e1.getGroupe().getId().equals(e2.getGroupe().getId())) {
            throw new BadRequestException("Votre binôme doit appartenir au même groupe que vous.");
        }
        if (!pfeProjectRepository.findActiveByEtudiantId(e2.getId(), StatutPfe.REJETE).isEmpty()) {
            throw new BadRequestException("L'étudiant choisi comme binôme participe déjà à un autre projet PFE actif.");
        }
        return e2;
    }

    private String formatBinome(Etudiant e1, Etudiant e2) {
        String s1 = e1.getPrenom() + " " + e1.getNom();
        if (e2 == null) return s1;
        return s1 + " & " + e2.getPrenom() + " " + e2.getNom();
    }

    private String formatNomProf(Enseignant e) {
        if (e == null) return null;
        return "Pr. " + e.getNom() + " " + e.getPrenom();
    }

    private boolean isValidFourMemberMatch(MatchJuryResponse resp, Set<Long> validIds) {
        if (resp == null || resp.getJury() == null) return false;
        JuryMembresDto j = resp.getJury();
        if (j.getEncadrant() == null || j.getRapporteur() == null
                || j.getExaminateurIa() == null || j.getPresidentHdr() == null) {
            return false;
        }
        try {
            Long eId = Long.valueOf(j.getEncadrant().getId());
            Long rId = Long.valueOf(j.getRapporteur().getId());
            Long xId = Long.valueOf(j.getExaminateurIa().getId());
            Long pId = Long.valueOf(j.getPresidentHdr().getId());
            Set<Long> parsed = Set.of(eId, rId, xId, pId);
            return parsed.size() == 4 && validIds.containsAll(parsed);
        } catch (NumberFormatException | NullPointerException ex) {
            return false;
        }
    }

    private String resolveRoleInJury(PfeJury jury, Long enseignantId) {
        if (jury == null || enseignantId == null) return null;
        if (jury.getPresidentHdr().getId().equals(enseignantId)) return "Président HDR";
        if (jury.getRapporteur().getId().equals(enseignantId)) return "Rapporteur";
        if (jury.getExaminateurIa().getId().equals(enseignantId)) return "Examinateur IA";
        if (jury.getEncadrant().getId().equals(enseignantId)) return "Encadrant";
        return null;
    }

    private String computeMention(BigDecimal noteFinale) {
        double val = noteFinale.doubleValue();
        if (val < 10.0) return "Ajourné";
        if (val < 12.0) return "Passable";
        if (val < 14.0) return "Assez Bien";
        if (val < 16.0) return "Bien";
        if (val < 18.0) return "Très Bien";
        return "Très Bien avec félicitations du jury";
    }

    private void notifierEtudiantsProjet(PfeProject p, String titre, String msg, String type, String lien) {
        if (p.getEtudiant1() != null) {
            notificationService.notifierParEmail(p.getEtudiant1().getEmail(), titre, msg, type, lien);
        }
        if (p.getEtudiant2() != null) {
            notificationService.notifierParEmail(p.getEtudiant2().getEmail(), titre, msg, type, lien);
        }
    }

    private SujetCatalogueDto mapSujetToDto(PfeSujetCatalogue s) {
        long occ = pfeProjectRepository.countBySujetCatalogueIdAndStatutNot(s.getId(), StatutPfe.REJETE);
        return SujetCatalogueDto.builder()
                .id(s.getId())
                .enseignantId(s.getEnseignant().getId())
                .enseignantNomComplet(formatNomProf(s.getEnseignant()))
                .enseignantGrade(s.getEnseignant().getGrade())
                .filiereId(s.getFiliere().getId())
                .filiereCode(s.getFiliere().getCode())
                .filiereLibelle(s.getFiliere().getLibelle())
                .titre(s.getTitre())
                .description(s.getDescription())
                .technologies(s.getTechnologies())
                .placesMax(s.getPlacesMax())
                .placesOccupees(occ)
                .estDisponible(s.getEstDisponible())
                .build();
    }

    private PfeProjectDto mapToProjectDto(PfeProject p, Long viewerEnseignantId) {
        PfeJury j = p.getJury();
        int nbEvals = (int) evaluationRepository.countByPfeProjetId(p.getId());
        String monRole = viewerEnseignantId != null ? resolveRoleInJury(j, viewerEnseignantId) : null;
        BigDecimal maNote = null;
        if (viewerEnseignantId != null) {
            maNote = evaluationRepository.findByPfeProjetIdAndEvaluateurId(p.getId(), viewerEnseignantId)
                    .map(PfeEvaluation::getTotal)
                    .orElse(null);
        }

        return PfeProjectDto.builder()
                .id(p.getId())
                .filiereId(p.getFiliere() != null ? p.getFiliere().getId() : null)
                .filiereCode(p.getFiliere() != null ? p.getFiliere().getCode() : null)
                .filiereLibelle(p.getFiliere() != null ? p.getFiliere().getLibelle() : null)
                .titre(p.getTitre())
                .resume(p.getResume())
                .technologiesCles(p.getTechnologiesCles())
                .binomeEtudiants(p.getBinomeEtudiants())
                .statut(p.getStatut())
                .origine(p.getOrigine())
                .entrepriseAccueil(p.getEntrepriseAccueil())
                .sujetCatalogueId(p.getSujetCatalogue() != null ? p.getSujetCatalogue().getId() : null)
                .etudiant1Id(p.getEtudiant1() != null ? p.getEtudiant1().getId() : null)
                .etudiant1Nom(p.getEtudiant1() != null ? p.getEtudiant1().getPrenom() + " " + p.getEtudiant1().getNom() : null)
                .etudiant2Id(p.getEtudiant2() != null ? p.getEtudiant2().getId() : null)
                .etudiant2Nom(p.getEtudiant2() != null ? p.getEtudiant2().getPrenom() + " " + p.getEtudiant2().getNom() : null)
                .encadrantSouhaiteId(p.getEncadrantSouhaite() != null ? p.getEncadrantSouhaite().getId() : null)
                .encadrantSouhaiteNom(formatNomProf(p.getEncadrantSouhaite()))
                .commentaireValidation(p.getCommentaireValidation())
                .noteFinale(p.getNoteFinale())
                .mention(p.getMention())
                .pvVerrouille(p.getPvVerrouille())
                .dateVerrouillage(p.getDateVerrouillage())
                .nbEvaluations(nbEvals)
                .monRoleJury(monRole)
                .maNoteSaisie(maNote)
                .juryId(j != null ? j.getId() : null)
                .encadrantId(j != null && j.getEncadrant() != null ? j.getEncadrant().getId() : null)
                .encadrantNom(j != null ? formatNomProf(j.getEncadrant()) : null)
                .rapporteurId(j != null && j.getRapporteur() != null ? j.getRapporteur().getId() : null)
                .rapporteurNom(j != null ? formatNomProf(j.getRapporteur()) : null)
                .presidentHdrId(j != null && j.getPresidentHdr() != null ? j.getPresidentHdr().getId() : null)
                .presidentHdrNom(j != null ? formatNomProf(j.getPresidentHdr()) : null)
                .examinateurIaId(j != null && j.getExaminateurIa() != null ? j.getExaminateurIa().getId() : null)
                .examinateurIaNom(j != null ? formatNomProf(j.getExaminateurIa()) : null)
                .salleSoutenanceId(j != null && j.getSalleSoutenance() != null ? j.getSalleSoutenance().getId() : null)
                .salleSoutenanceCode(j != null && j.getSalleSoutenance() != null ? j.getSalleSoutenance().getCodeSalle() : null)
                .dateSoutenance(j != null ? j.getDateSoutenance() : null)
                .scoreAffiniteIa(j != null ? j.getScoreAffiniteIa() : null)
                .justificationIa(j != null ? j.getJustificationIa() : null)
                .build();
    }

    private EvaluationPfeDto mapEvalToDto(PfeEvaluation ev) {
        return EvaluationPfeDto.builder()
                .id(ev.getId())
                .pfeProjetId(ev.getPfeProjet().getId())
                .evaluateurId(ev.getEvaluateur().getId())
                .evaluateurNomComplet(formatNomProf(ev.getEvaluateur()))
                .evaluateurGrade(ev.getEvaluateur().getGrade())
                .roleJury(ev.getRoleJury())
                .noteTechnique(ev.getNoteTechnique())
                .noteRapport(ev.getNoteRapport())
                .noteDemo(ev.getNoteDemo())
                .noteReponses(ev.getNoteReponses())
                .total(ev.getTotal())
                .commentaire(ev.getCommentaire())
                .build();
    }

    private PvSoutenanceDto buildPvDto(PfeProject p, List<PfeEvaluation> evals) {
        List<String> etudiants = new ArrayList<>();
        if (p.getEtudiant1() != null) {
            etudiants.add(p.getEtudiant1().getPrenom() + " " + p.getEtudiant1().getNom() + " (" + p.getEtudiant1().getMatricule() + ")");
        }
        if (p.getEtudiant2() != null) {
            etudiants.add(p.getEtudiant2().getPrenom() + " " + p.getEtudiant2().getNom() + " (" + p.getEtudiant2().getMatricule() + ")");
        }
        if (etudiants.isEmpty() && p.getBinomeEtudiants() != null) {
            etudiants.add(p.getBinomeEtudiants());
        }

        List<MembreJuryDto> juryList = new ArrayList<>();
        PfeJury j = p.getJury();
        if (j != null) {
            juryList.add(toMembreDto(j.getPresidentHdr(), "Président HDR"));
            juryList.add(toMembreDto(j.getRapporteur(), "Rapporteur"));
            juryList.add(toMembreDto(j.getExaminateurIa(), "Examinateur IA"));
            juryList.add(toMembreDto(j.getEncadrant(), "Encadrant"));
        }

        return PvSoutenanceDto.builder()
                .projet(mapToProjectDto(p, null))
                .etudiants(etudiants)
                .jury(juryList)
                .evaluations(evals.stream().map(this::mapEvalToDto).toList())
                .noteFinale(p.getNoteFinale())
                .mention(p.getMention())
                .dateSoutenance(j != null ? j.getDateSoutenance() : null)
                .salle(j != null && j.getSalleSoutenance() != null ? j.getSalleSoutenance().getCodeSalle() : null)
                .campus(j != null && j.getSalleSoutenance() != null && j.getSalleSoutenance().getCampus() != null
                        ? j.getSalleSoutenance().getCampus().getNom() : "EMSI")
                .pvVerrouille(p.getPvVerrouille())
                .dateVerrouillage(p.getDateVerrouillage())
                .build();
    }

    private MembreJuryDto toMembreDto(Enseignant e, String role) {
        return MembreJuryDto.builder()
                .id(String.valueOf(e.getId()))
                .nom(e.getNom())
                .prenom(e.getPrenom())
                .role(role)
                .grade(e.getGrade())
                .specialite(e.getSpecialite())
                .departement("EMSI")
                .statut(e.getTypeContrat() != null ? e.getTypeContrat().name() : "PERMANENT")
                .build();
    }
}
