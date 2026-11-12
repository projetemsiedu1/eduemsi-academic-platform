package ma.emsi.academic.service.solver.global;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.domain.solver.*;
import ma.emsi.academic.domain.enums.*;
import ma.emsi.academic.dto.planning.TimetableSolveResult;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service @RequiredArgsConstructor
public class TimetableProposalService {
    private final TimetableProposalRepository proposals;
    private final TimetableProblemBuilder builder;
    private final TimetableSolutionValidator validator;
    private final SeanceRepository sessions;
    private final EntityManager em;
    private final ObjectMapper mapper;
    public String fingerprint(TimetableProblem p) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(mapper.writeValueAsBytes(p))); }
        catch (Exception e) { throw new IllegalStateException("Impossible de calculer l’empreinte du planning.", e); }
    }
    @Transactional public TimetableSolveResult store(String owner, TimetableProblem p, TimetableSolveResult result) {
        var proposal = new TimetableProposal(); proposal.setId(UUID.randomUUID().toString()); proposal.setOwner(owner);
        proposal.setState("PENDING"); proposal.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES)); proposal.setFingerprint(fingerprint(p));
        var response = result.proposal(proposal.getId(), "PENDING");
        try { proposal.setSolutionJson(mapper.writeValueAsString(response)); }
        catch (Exception e) { throw new IllegalStateException("Impossible de préparer la proposition.", e); }
        proposals.saveAndFlush(proposal); return response;
    }
    @Transactional(readOnly = true) public TimetableSolveResult get(String id, String owner) { var p = owned(id, owner, false); return read(p).proposal(p.getId(), p.getState()); }
    @Transactional public TimetableSolveResult accept(String id, String owner) {
        var proposal = owned(id, owner, true);
        if ("ACCEPTED".equals(proposal.getState())) return read(proposal).proposal(id, "ACCEPTED"); // Idempotent retry.
        pending(proposal);
        // Same resource lock order as manual PlanningService.save: teachers, groups, rooms.
        lockAll(Enseignant.class); lockAll(Groupe.class); lockAll(Salle.class);
        lockAll(ma.emsi.academic.domain.entity.Module.class); lockAll(ElementModule.class);
        lockAll(TeachingRequirement.class); lockAll(TeacherQualification.class);
        var current = builder.build();
        if (!proposal.getFingerprint().equals(fingerprint(current))) throw new TimetableConflictException("Les ressources, besoins ou séances ont changé depuis le calcul. Relancez la planification ; aucune séance n’a été enregistrée.");
        var result = read(proposal);
        var errors = validator.validate(current, result.assignments(), true);
        if (!result.validated() || !errors.isEmpty()) throw new TimetableConflictException("La proposition ne respecte plus les contraintes : " + String.join(" ", errors));
        for (var a : result.assignments()) {
            var session = Seance.builder()
                .groupe(em.getReference(Groupe.class, Long.valueOf(a.groupId())))
                .enseignant(em.getReference(Enseignant.class, Long.valueOf(a.teacherId())))
                .salle(em.getReference(Salle.class, Long.valueOf(a.roomId())))
                .elementModule(em.getReference(ElementModule.class, Long.valueOf(a.elementId())))
                .jourSemaine(JourSemaine.valueOf(a.day())).numeroCreneau(CreneauHoraire.valueOf(a.slot()))
                .spanSeances(1).statutAffectation("CPSAT_" + result.status()).build();
            sessions.save(session);
        }
        sessions.flush(); proposal.setState("ACCEPTED"); proposals.flush();
        return result.proposal(id, "ACCEPTED");
    }
    @Transactional public TimetableSolveResult reject(String id, String owner) {
        var p = owned(id, owner, true); pending(p); p.setState("REJECTED"); return read(p).proposal(id, "REJECTED");
    }
    private TimetableProposal owned(String id, String owner, boolean lock) {
        var p = lock ? em.find(TimetableProposal.class, id, LockModeType.PESSIMISTIC_WRITE) : proposals.findById(id).orElse(null);
        if (p == null) throw new ResourceNotFoundException("Proposition introuvable.");
        if (!p.getOwner().equals(owner)) throw new AccessDeniedException("Cette proposition appartient à un autre responsable.");
        return p;
    }
    private void pending(TimetableProposal p) {
        if (!p.getState().equals("PENDING")) throw new TimetableConflictException("Cette proposition a déjà été traitée.");
        if (p.getExpiresAt().isBefore(Instant.now())) throw new TimetableConflictException("La proposition a expiré après 30 minutes. Relancez le calcul.");
    }
    private TimetableSolveResult read(TimetableProposal p) {
        try { return mapper.readValue(p.getSolutionJson(), TimetableSolveResult.class); }
        catch (Exception e) { throw new IllegalStateException("Proposition illisible.", e); }
    }
    private <T> void lockAll(Class<T> type) { em.createQuery("select e from " + type.getSimpleName() + " e order by e.id", type).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList(); }
}
