package ma.emsi.academic.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.*;
import ma.emsi.academic.repository.*;
import ma.emsi.academic.exception.BadRequestException;
import ma.emsi.academic.service.solver.global.TimetableConflictException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

/** Explicit reset of sessions only. Archive first, then one atomic database transaction. */
@Service @RequiredArgsConstructor
public class PlanningResetService {
    private final EntityManager em;
    private final SeanceRepository sessions;
    private final AbsenceRepository absences;
    private final TimetableProposalRepository proposals;
    private final PlanningService planning;
    private final ObjectMapper mapper;
    @Value("${univora.planning-backup-directory:.planning-backups}") private String backupDirectory;
    public record ResetResult(int deletedSessions, String backupFile) {}

    @Transactional
    public ResetResult reset(List<Long> expectedIds, String owner) {
        // Approval locks a proposal before its resources: keep the same order here.
        var lockedProposals = em.createQuery("select p from TimetableProposal p order by p.id", ma.emsi.academic.domain.solver.TimetableProposal.class).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList();
        lock(Enseignant.class); lock(Groupe.class); lock(Salle.class);
        var current = em.createQuery("select s from Seance s order by s.id", Seance.class).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList();
        var ids = current.stream().map(Seance::getId).toList();
        if (!new TreeSet<>(ids).equals(new TreeSet<>(expectedIds)))
            throw new TimetableConflictException("Le planning a changé depuis son affichage. Actualisez avant de le vider. Aucune séance supprimée.");
        if (ids.isEmpty()) return new ResetResult(0, null);
        long recorded = ids.stream().filter(absences::existsBySeanceId).count();
        if (recorded > 0) throw new BadRequestException(recorded + " séance(s) contiennent des absences. La remise à zéro est refusée pour conserver ce suivi ; aucune séance supprimée.");
        String name = "planning-" + UUID.randomUUID() + ".json";
        try {
            Path directory = Path.of(backupDirectory).toAbsolutePath().normalize();
            Files.createDirectories(directory);
            Path archive = directory.resolve(name).normalize();
            if (!archive.getParent().equals(directory)) throw new IllegalStateException();
            try (var output = Files.newOutputStream(archive, StandardOpenOption.CREATE_NEW)) {
              mapper.writerWithDefaultPrettyPrinter().writeValue(output,
                    Map.of("createdAt", Instant.now().toString(), "requestedBy", owner, "workspace", planning.snapshot()));
            }
        } catch (Exception e) {
            throw new BadRequestException("La sauvegarde préalable n’a pas pu être créée. Vérifiez le dossier d’archives et l’espace disque ; aucune séance supprimée.");
        }
        sessions.deleteAll(current); sessions.flush();
        for (var p : lockedProposals) if ("PENDING".equals(p.getState())) p.setState("REJECTED");
        proposals.flush();
        return new ResetResult(ids.size(), name);
    }
    private <T> void lock(Class<T> type) { em.createQuery("select e from " + type.getSimpleName() + " e order by e.id", type).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultList(); }
}
