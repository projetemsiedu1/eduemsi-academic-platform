package ma.emsi.academic.service.ai;

import ma.emsi.academic.dto.pfe.JuryMembresDto;
import ma.emsi.academic.dto.pfe.MatchJuryRequest;
import ma.emsi.academic.dto.pfe.MatchJuryResponse;
import ma.emsi.academic.dto.pfe.MembreJuryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GeminiAiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiServiceClient.class);

    private final OpenRouterAiService openRouterAiService;

    public GeminiAiServiceClient(OpenRouterAiService openRouterAiService) {
        this.openRouterAiService = openRouterAiService;
    }

    /**
     * Analyse sémantique d'un sujet PFE et matching de jury avec OpenRouter Free Tier (Gemini 2.0 Flash / Llama 3.3).
     */
    public Map<String, Object> matcherJuryPfe(String titrePfe, String resume, List<Map<String, String>> enseignants) {
        return matcherJuryPfe(titrePfe, resume, "", null, enseignants);
    }

    public Map<String, Object> matcherJuryPfe(String titrePfe, String resume, String technologies, String encadrant, List<Map<String, String>> enseignants) {
        MatchJuryRequest request = MatchJuryRequest.builder()
                .sujet(titrePfe)
                .resume(resume)
                .technologies(technologies)
                .encadrant(encadrant)
                .build();

        MatchJuryResponse response = openRouterAiService.matcherJuryPfe(request, enseignants);
        return convertirResponseEnMap(response);
    }

    /**
     * Analyse IA du CV d'un enseignant candidat et détection de compatibilité avec les filières déficitaires.
     */
    public Map<String, Object> analyserCvCandidat(String cvTexte, List<String> matieresDeficitaires) {
        return openRouterAiService.analyserCvCandidat(cvTexte, matieresDeficitaires);
    }

    private Map<String, Object> convertirResponseEnMap(MatchJuryResponse resp) {
        Map<String, Object> map = new HashMap<>();
        JuryMembresDto jury = resp.getJury();

        map.put("sujet", resp.getSujet());
        map.put("resume", resp.getResume());
        map.put("technologies", resp.getTechnologies());

        if (jury != null) {
            if (jury.getEncadrant() != null) map.put("encadrantRecommande", jury.getEncadrant().getNom());
            if (jury.getRapporteur() != null) map.put("rapporteurRecommande", jury.getRapporteur().getNom());
            if (jury.getExaminateurIa() != null) map.put("examinateurRecommande", jury.getExaminateurIa().getNom());
            if (jury.getPresidentHdr() != null) map.put("presidentRecommande", jury.getPresidentHdr().getNom());
            map.put("jury", jury);
        }

        map.put("scoreGlobalMatching", resp.getScoreMatching());
        map.put("justificationIa", resp.getJustification());
        map.put("modeExecution", resp.getModeleUtilise());
        map.put("statut", resp.getStatut());

        return map;
    }
}
