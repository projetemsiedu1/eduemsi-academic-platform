package ma.emsi.academic.service.solver.global;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.enums.CreneauHoraire;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.service.PlanningService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import static ma.emsi.academic.service.solver.global.TimetableProblem.*;

@Service @RequiredArgsConstructor
public class TimetableProblemBuilder {
    private final PlanningService planning;
    private final TimetableCalendar calendar;
    private final TeachingRequirementRepository requirements;
    private final TeacherQualificationRepository qualifications;

    @Transactional(readOnly = true)
    public TimetableProblem build() {
        var s = planning.snapshot();
        var moduleFilieres = new HashMap<String, String>();
        s.modules().forEach(m -> moduleFilieres.put(m.id(), m.filiereId()));
        var fixed = new ArrayList<Assignment>();
        for (var session : s.seances().stream().sorted(Comparator.comparing(ma.emsi.academic.dto.planning.PlanningSnapshot.SeanceData::id)).toList()) {
            int start = CreneauHoraire.valueOf(session.numeroCreneau()).ordinal();
            if (session.spanSeances() < 1 || start + session.spanSeances() > CreneauHoraire.values().length)
                throw new BadRequestException("Une séance existante dépasse les créneaux connus : " + session.id());
            for (int i = 0; i < session.spanSeances(); i++) fixed.add(new Assignment(null, session.groupeId(), session.elementModuleId(), session.enseignantId(), session.salleId(), session.jourSemaine(), CreneauHoraire.values()[start + i].name()));
        }
        return new TimetableProblem(calendar.definition(),
            s.salles().stream().sorted(Comparator.comparing(ma.emsi.academic.dto.planning.PlanningSnapshot.SalleData::id)).map(r -> new Room(r.id(), r.campusId(), r.typeSalle(), r.capacite(), r.nombrePcOperationnels(), r.estDisponible())).toList(),
            s.enseignants().stream().sorted(Comparator.comparing(ma.emsi.academic.dto.planning.PlanningSnapshot.EnseignantData::id)).map(t -> new Teacher(t.id(), t.estActif(), t.typeContrat().equals("VACATAIRE"), t.heuresContractuellesSemaine(), t.disponibilites())).toList(),
            s.groupes().stream().sorted(Comparator.comparing(ma.emsi.academic.dto.planning.PlanningSnapshot.GroupeData::id)).map(g -> new Group(g.id(), g.campusFixeId(), g.filiereId(), g.effectif())).toList(),
            s.elements().stream().sorted(Comparator.comparing(ma.emsi.academic.dto.planning.PlanningSnapshot.ElementData::id)).map(e -> new Element(e.id(), e.moduleId(), moduleFilieres.get(e.moduleId()), e.typeSalleRequis())).toList(),
            requirements.findAll().stream().sorted(Comparator.comparing(ma.emsi.academic.domain.solver.TeachingRequirement::getId)).map(r -> new Requirement(r.getId().toString(), r.getGroupeId().toString(), r.getElementId().toString(), r.getEnseignantId().toString(), r.getWeeklySessions())).toList(),
            qualifications.findAll().stream().sorted(Comparator.comparing(ma.emsi.academic.domain.solver.TeacherQualification::getId)).map(q -> new Qualification(q.getEnseignantId().toString(), q.getModuleId().toString())).toList(), fixed);
    }
}
