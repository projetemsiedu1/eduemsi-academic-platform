package ma.emsi.academic.service.solver.global;

import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.solver.*;
import ma.emsi.academic.exception.*;
import ma.emsi.academic.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service @RequiredArgsConstructor
public class TimetableRequirementService {
    private final TeachingRequirementRepository requirements;
    private final TeacherQualificationRepository qualifications;
    private final GroupeRepository groups;
    private final ElementModuleRepository elements;
    private final EnseignantRepository teachers;
    private final ModuleRepository modules;
    public record RequirementInput(@NotNull(message = "Le groupe est obligatoire.") Long groupeId,
            @NotNull(message = "L’élément de module est obligatoire.") Long elementId,
            @NotNull(message = "L’enseignant préaffecté est obligatoire.") Long enseignantId,
            @Min(value = 1, message = "Au moins une séance est requise.") @Max(value = 36, message = "Au maximum 36 séances par semaine.") int weeklySessions) {}
    public record QualificationInput(@NotNull(message = "L’enseignant est obligatoire.") Long enseignantId,
            @NotNull(message = "Le module est obligatoire.") Long moduleId) {}
    public record Configuration(List<TeachingRequirement> requirements, List<TeacherQualification> qualifications) {}
    @Transactional(readOnly = true) public Configuration configuration() { return new Configuration(requirements.findAll(), qualifications.findAll()); }
    @Transactional public TeachingRequirement save(Long id, RequirementInput input) {
        var group = groups.findById(input.groupeId()).orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));
        var element = elements.findById(input.elementId()).orElseThrow(() -> new ResourceNotFoundException("Élément de module introuvable."));
        var teacher = teachers.findById(input.enseignantId()).orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable."));
        if (!Boolean.TRUE.equals(teacher.getEstActif())) throw new BadRequestException("Cet enseignant est inactif.");
        if (!Objects.equals(group.getFiliere().getId(), element.getModule().getFiliere().getId())) throw new BadRequestException("Ce module ne correspond pas à la filière du groupe.");
        if (qualifications.findAll().stream().noneMatch(q -> q.getEnseignantId().equals(input.enseignantId()) && q.getModuleId().equals(element.getModule().getId()))) throw new BadRequestException("Enregistrez d’abord la qualification de cet enseignant pour ce module.");
        if (requirements.findAll().stream().anyMatch(r -> !Objects.equals(id, r.getId()) && r.getGroupeId().equals(input.groupeId()) && r.getElementId().equals(input.elementId()))) throw new BadRequestException("Un besoin existe déjà pour ce groupe et cet élément ; modifiez-le.");
        var requirement = id == null ? new TeachingRequirement() : requirements.findById(id).orElseThrow(() -> new ResourceNotFoundException("Besoin introuvable."));
        requirement.setGroupeId(input.groupeId()); requirement.setElementId(input.elementId()); requirement.setEnseignantId(input.enseignantId()); requirement.setWeeklySessions(input.weeklySessions());
        return requirements.saveAndFlush(requirement);
    }
    @Transactional public void delete(Long id) {
        var r = requirements.findById(id).orElseThrow(() -> new ResourceNotFoundException("Besoin introuvable."));
        requirements.delete(r); // Existing sessions are deliberately not cascaded.
    }
    @Transactional public TeacherQualification qualify(QualificationInput input) {
        if (!teachers.existsById(input.enseignantId()) || !modules.existsById(input.moduleId())) throw new ResourceNotFoundException("Enseignant ou module introuvable.");
        var existing = qualifications.findAll().stream().filter(q -> q.getEnseignantId().equals(input.enseignantId()) && q.getModuleId().equals(input.moduleId())).findFirst();
        if (existing.isPresent()) return existing.get();
        var q = new TeacherQualification(); q.setEnseignantId(input.enseignantId()); q.setModuleId(input.moduleId()); return qualifications.saveAndFlush(q);
    }
    @Transactional public void unqualify(Long id) {
        var q = qualifications.findById(id).orElseThrow(() -> new ResourceNotFoundException("Qualification introuvable."));
        if (requirements.findAll().stream().anyMatch(r -> r.getEnseignantId().equals(q.getEnseignantId()) && elements.findById(r.getElementId()).map(e -> e.getModule().getId().equals(q.getModuleId())).orElse(false))) throw new BadRequestException("Cette qualification est utilisée par un besoin pédagogique.");
        qualifications.delete(q);
    }
}
