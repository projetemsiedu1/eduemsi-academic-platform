package ma.emsi.academic.service.solver.global;

import ma.emsi.academic.domain.enums.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.time.LocalTime;
import java.time.Duration;
import java.util.*;

/** Retains existing enum/database identifiers. Times have a single Java source. */
@Component
public class TimetableCalendar {
    public record Slot(String code, String heureDebut, String heureFin, int minutes) {}
    public record Calendar(List<String> days, List<Slot> slots, String lunchStart, String lunchEnd, int slotMinutes, String label) {}
    private final Calendar calendar;
    public TimetableCalendar(
            @Value("${univora.timetable.days:LUNDI,MARDI,MERCREDI,JEUDI,VENDREDI,SAMEDI}") List<String> days,
            @Value("${univora.timetable.slots:S1_08H30,S2_10H15,S3_12H00,S4_13H45,S5_15H30,S6_17H15}") List<String> slots,
            @Value("${univora.timetable.lunch-start:11:45}") String lunchStart,
            @Value("${univora.timetable.lunch-end:13:45}") String lunchEnd) {
        var start = LocalTime.parse(lunchStart); var end = LocalTime.parse(lunchEnd);
        if (!start.isBefore(end)) throw new IllegalArgumentException("Pause déjeuner invalide.");
        var dayNames = days.stream().map(JourSemaine::valueOf).distinct().sorted().map(Enum::name).toList();
        var enabled = slots.stream().map(CreneauHoraire::valueOf).distinct().sorted()
                .filter(s -> !LocalTime.parse(s.getHeureDebut()).isBefore(end) || !LocalTime.parse(s.getHeureFin()).isAfter(start))
                .map(s -> new Slot(s.name(), s.getHeureDebut(), s.getHeureFin(), (int) Duration.between(LocalTime.parse(s.getHeureDebut()), LocalTime.parse(s.getHeureFin())).toMinutes())).toList();
        if (enabled.isEmpty() || dayNames.isEmpty() || enabled.stream().anyMatch(s -> s.minutes() != 90)) throw new IllegalArgumentException("Le calendrier doit contenir des créneaux de 90 minutes.");
        calendar = new Calendar(dayNames, enabled, lunchStart, lunchEnd, 90, "Calendrier de démonstration configurable — horaires EMSI à confirmer");
    }
    public Calendar definition() { return calendar; }
}
