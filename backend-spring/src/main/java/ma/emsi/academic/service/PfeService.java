package ma.emsi.academic.service;

import ma.emsi.academic.domain.enums.StatutPfe;
import ma.emsi.academic.dto.pfe.*;

import java.util.List;

public interface PfeService {
    List<PfeProjectDto> listProjets(StatutPfe statut);
    PfeProjectDto getProjet(Long id);
    PfeProjectDto updateProjet(Long id, CreatePfeProjectRequest request);
    void deleteProjet(Long id);

    PfeProjectDto getMonPfe(String username);
    PfeProjectDto soumettreSujetStage(String username, SoumettreSujetStageRequest request);

    List<SujetCatalogueDto> getSujetsCatalogue(String username, String role);
    PfeProjectDto choisirSujetCatalogue(String username, Long sujetId, ChoisirSujetRequest request);

    List<SujetCatalogueDto> getMesSujets(String username);
    SujetCatalogueDto createSujetCatalogue(String username, CreateSujetCatalogueRequest request);
    SujetCatalogueDto updateSujetCatalogue(String username, boolean isPrivileged, Long id, CreateSujetCatalogueRequest request);
    void deleteSujetCatalogue(String username, boolean isPrivileged, Long id);

    PfeProjectDto validerSujet(Long id, ValiderSujetRequest request);
    MatchJuryResponse proposerJury(Long id);
    PfeProjectDto planifierJury(Long id, PlanifierSoutenanceRequest request);

    List<PfeProjectDto> getMesJurys(String username);
    EvaluationPfeDto enregistrerEvaluationMoi(Long pfeId, String username, EvaluationPfeRequest request);
    EvaluationPfeDto enregistrerEvaluationPourEnseignant(Long pfeId, Long enseignantId, EvaluationPfeRequest request);
    List<EvaluationPfeDto> getEvaluations(Long pfeId);
    PvSoutenanceDto verrouillerPv(Long pfeId, String username, boolean isSuperAdmin);
    PvSoutenanceDto getPv(Long pfeId);
}
