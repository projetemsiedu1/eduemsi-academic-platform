package ma.emsi.academic.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.enums.CreneauHoraire;
import ma.emsi.academic.domain.enums.TypeSalle;
import ma.emsi.academic.dto.planning.PlanningSnapshot;
import ma.emsi.academic.dto.planning.PlanningSnapshot.*;
import ma.emsi.academic.dto.planning.SaveSeanceRequest;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PlanningService {
    private final CampusRepository campuses;
    private final SalleRepository salles;
    private final EnseignantRepository enseignants;
    private final FiliereRepository filieres;
    private final GroupeRepository groupes;
    private final ModuleRepository modules;
    private final ElementModuleRepository elements;
    private final SeanceRepository seances;
    private final AbsenceRepository absences;
    private final EntityManager entityManager;
    private final PlanningAvailability availabilityParser;

    @Transactional(readOnly = true)
    public PlanningSnapshot snapshot() {
        var allGroupes = groupes.findAll();
        var options = allGroupes.stream().filter(g -> g.getOptionSpecialite() != null && !g.getOptionSpecialite().isBlank())
                .map(g -> new OptionData(g.getFiliere().getId() + ":" + g.getOptionSpecialite(), g.getOptionSpecialite(),
                        g.getOptionSpecialite(), id(g.getFiliere().getId()))).distinct().toList();
        return new PlanningSnapshot(
                campuses.findAll().stream().map(c -> new CampusData(id(c.getId()), c.getNom(), c.getNom(), c.getAdresse(), c.getVille(), List.of())).toList(),
                salles.findAll().stream().map(s -> new SalleData(id(s.getId()), s.getCodeSalle(), id(s.getCampus().getId()), "",
                        s.getTypeSalle().name(), s.getCapacite(), s.getNombrePcOperationnels(), text(s.getSpecsEquipements()), Boolean.TRUE.equals(s.getEstDisponible()))).toList(),
                enseignants.findAll().stream().map(e -> new EnseignantData(id(e.getId()), e.getMatricule(), e.getNom(), e.getPrenom(), e.getEmail(),
                        text(e.getTelephone()), text(e.getSpecialite()), e.getTypeContrat().name(), e.getHeuresContractuellesSemaine(),
                        disponibilites(e.getDisponibilitesFixesJson()), Boolean.TRUE.equals(e.getEstActif()), List.of())).toList(),
                filieres.findAll().stream().map(f -> new FiliereData(id(f.getId()), f.getCode(), f.getLibelle(), "", "")).toList(), options,
                allGroupes.stream().map(g -> new GroupeData(id(g.getId()), g.getCodeGroupe(), id(g.getFiliere().getId()),
                        g.getOptionSpecialite() == null ? null : g.getFiliere().getId() + ":" + g.getOptionSpecialite(), g.getAnneeEtude(),
                        g.getEffectif(), text(g.getDelegueNom()), id(g.getCampusFixe().getId()), text(g.getLaboratoiresRequis()))).toList(),
                modules.findAll().stream().map(m -> new ModuleData(id(m.getId()), m.getCodeModule(), m.getIntitule(), id(m.getFiliere().getId()), m.getSemestre(), m.getVolumeHoraireTotal())).toList(),
                elements.findAll().stream().map(e -> new ElementData(id(e.getId()), id(e.getModule().getId()), e.getCodeElement(), e.getIntitule(),
                        e.getVolumeHoraire(), e.getTypeSalleRequis() == TypeSalle.STANDARD ? "COURS" : "TP", e.getTypeSalleRequis() == TypeSalle.LI_PC, e.getTypeSalleRequis().name())).toList(),
                seances.findAll().stream().map(this::dto).toList());
    }

    @Transactional
    public SeanceData save(Long existingId, SaveSeanceRequest request) {
        // Serialize assignments sharing a teacher, group or room, including multi-slot sessions.
        var teacher = locked(Enseignant.class, request.enseignantId());
        var group = locked(Groupe.class, request.groupeId());
        var room = locked(Salle.class, request.salleId());
        var element = elements.findById(request.elementModuleId()).orElseThrow(() -> new ResourceNotFoundException("Élément de module introuvable."));
        var session = existingId == null ? Seance.builder().build() : seances.findById(existingId).orElseThrow(() -> new ResourceNotFoundException("Séance introuvable."));
        if (!Boolean.TRUE.equals(teacher.getEstActif()) || !Boolean.TRUE.equals(room.getEstDisponible())) reject("L’enseignant ou la salle est indisponible.");
        if (!group.getCampusFixe().getId().equals(room.getCampus().getId())) reject("La salle doit appartenir au campus fixe du groupe.");
        if (!group.getFiliere().getId().equals(element.getModule().getFiliere().getId())) reject("Le module ne correspond pas à la filière du groupe.");
        if (room.getCapacite() < group.getEffectif()) reject("La capacité de la salle est insuffisante.");
        if (element.getTypeSalleRequis() == TypeSalle.LI_PC && (room.getTypeSalle() != TypeSalle.LI_PC || room.getNombrePcOperationnels() < group.getEffectif())) reject("Un laboratoire avec un poste par étudiant est requis.");
        if (element.getTypeSalleRequis() == TypeSalle.LR_RESEAUX && room.getTypeSalle() != TypeSalle.LR_RESEAUX) reject("Un laboratoire réseaux est requis.");
        if (element.getTypeSalleRequis() == TypeSalle.AMPHI && room.getTypeSalle() != TypeSalle.AMPHI) reject("Un amphithéâtre est requis.");
        int start = request.numeroCreneau().ordinal(), end = start + request.spanSeances();
        if (end > CreneauHoraire.values().length) reject("La séance dépasse le dernier créneau de la journée.");
        var availability = disponibilites(teacher.getDisponibilitesFixesJson());
        if (!availability.isEmpty()) {
            var slots = availability.stream().filter(d -> d.jour().equals(request.jourSemaine().name())).flatMap(d -> d.creneaux().stream()).toList();
            for (int index = start; index < end; index++) if (!slots.contains(CreneauHoraire.values()[index].name())) reject("Le créneau ne respecte pas les disponibilités de l’enseignant.");
        }
        for (var other : seances.findAll()) {
            if (Objects.equals(other.getId(), existingId) || other.getJourSemaine() != request.jourSemaine()) continue;
            int otherStart = other.getNumeroCreneau().ordinal();
            boolean overlaps = start < otherStart + other.getSpanSeances() && otherStart < end;
            if (overlaps && (other.getSalle().getId().equals(room.getId()) || other.getEnseignant().getId().equals(teacher.getId()) || other.getGroupe().getId().equals(group.getId()))) reject("La salle, le groupe ou l’enseignant est déjà occupé sur cette plage horaire.");
        }
        session.setGroupe(group); session.setSalle(room); session.setEnseignant(teacher); session.setElementModule(element);
        session.setJourSemaine(request.jourSemaine()); session.setNumeroCreneau(request.numeroCreneau());
        session.setSpanSeances(request.spanSeances()); session.setStatutAffectation("MANUEL");
        return dto(seances.saveAndFlush(session));
    }

    @Transactional
    public void delete(Long id) {
        var session = seances.findById(id).orElseThrow(() -> new ResourceNotFoundException("Séance introuvable."));
        if (absences.existsBySeanceId(id)) reject("Cette séance contient des absences et ne peut pas être supprimée.");
        seances.delete(session);
    }

    @Transactional
    public void createModule(ma.emsi.academic.dto.planning.CreatePlanningModuleRequest request) {
        var filiere = filieres.findById(request.filiereId()).orElseThrow(() -> new ResourceNotFoundException("Filière introuvable."));
        String code = request.code().trim().toUpperCase(java.util.Locale.ROOT);
        if (modules.findAll().stream().anyMatch(m -> m.getCodeModule().equalsIgnoreCase(code))) reject("Ce code de module existe déjà.");
        var module = ma.emsi.academic.domain.entity.Module.builder().codeModule(code).intitule(request.intitule().trim()).filiere(filiere).semestre(request.semestre()).volumeHoraireTotal(request.volumeHoraire()).build();
        module = modules.saveAndFlush(module);
        elements.save(ElementModule.builder().module(module).codeElement(code + "-01").intitule(request.intitule().trim()).typeSalleRequis(request.typeSalleRequis()).volumeHoraire(request.volumeHoraire()).build());
    }

    private <T> T locked(Class<T> type, Long id) {
        T entity = entityManager.find(type, id, LockModeType.PESSIMISTIC_WRITE);
        if (entity == null) throw new ResourceNotFoundException("Ressource de planification introuvable.");
        return entity;
    }
    private List<Disponibilite> disponibilites(String json) {
        return availabilityParser.read(json);
    }
    private SeanceData dto(Seance s) { return new SeanceData(id(s.getId()), id(s.getGroupe().getId()), id(s.getSalle().getId()), id(s.getEnseignant().getId()), id(s.getElementModule().getId()), s.getJourSemaine().name(), s.getNumeroCreneau().name(), s.getSpanSeances(), s.getStatutAffectation()); }
    private static String id(Long value) { return String.valueOf(value); }
    private static String text(String value) { return value == null ? "" : value; }
    private static void reject(String message) { throw new BadRequestException(message); }
}
