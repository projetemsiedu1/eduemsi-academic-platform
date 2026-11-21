package ma.emsi.academic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.enums.CreneauHoraire;
import ma.emsi.academic.domain.enums.JourSemaine;
import ma.emsi.academic.dto.planning.PlanningSnapshot.Disponibilite;
import ma.emsi.academic.exception.BadRequestException;
import org.springframework.stereotype.Component;
import java.time.LocalTime;
import java.util.*;

/** Accepts the existing SQL seed format and the structured planning form format. */
@Component
@RequiredArgsConstructor
public class PlanningAvailability {
    private final ObjectMapper mapper;
    public List<Disponibilite> read(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            JsonNode root = mapper.readTree(json);
            Map<String, Set<String>> days = new LinkedHashMap<>();
            if (root.isArray()) {
                for (JsonNode day : root) {
                    String name = JourSemaine.valueOf(day.path("jour").asText()).name();
                    if (!day.path("creneaux").isArray()) throw new IllegalArgumentException();
                    var slots = days.computeIfAbsent(name, key -> new LinkedHashSet<>());
                    for (JsonNode slot : day.get("creneaux")) slots.add(CreneauHoraire.valueOf(slot.asText()).name());
                }
            } else if (root.path("jours").isArray() && root.path("plages").isArray()) {
                Set<String> slots = new LinkedHashSet<>();
                for (JsonNode range : root.get("plages")) {
                    String[] ends = range.asText().replace('h', ':').split("-");
                    LocalTime start = LocalTime.parse(ends[0]), end = LocalTime.parse(ends[1]);
                    if (!start.isBefore(end)) throw new IllegalArgumentException();
                    for (var slot : CreneauHoraire.values()) if (!LocalTime.parse(slot.getHeureDebut()).isBefore(start) && !LocalTime.parse(slot.getHeureFin()).isAfter(end)) slots.add(slot.name());
                }
                for (JsonNode day : root.get("jours")) days.put(JourSemaine.valueOf(day.asText()).name(), slots);
            } else throw new IllegalArgumentException();
            return days.entrySet().stream().map(e -> new Disponibilite(e.getKey(), List.copyOf(e.getValue()))).toList();
        } catch (Exception exception) { throw new BadRequestException("Le format des disponibilités de l’enseignant est invalide."); }
    }
}
