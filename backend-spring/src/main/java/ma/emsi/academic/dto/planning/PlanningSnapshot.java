package ma.emsi.academic.dto.planning;

import java.util.List;

/** Read model shared by the planning views. IDs are strings for the web client. */
public record PlanningSnapshot(
        List<CampusData> campuses, List<SalleData> salles, List<EnseignantData> enseignants,
        List<FiliereData> filieres, List<OptionData> options, List<GroupeData> groupes,
        List<ModuleData> modules, List<ElementData> elements, List<SeanceData> seances) {
    public record CampusData(String id, String nom, String code, String adresse, String ville, List<String> etages) {}
    public record SalleData(String id, String codeSalle, String campusId, String etage, String typeSalle,
                            int capacite, int nombrePcOperationnels, String specsEquipements, boolean estDisponible) {}
    public record Disponibilite(String jour, List<String> creneaux) {}
    public record EnseignantData(String id, String matricule, String nom, String prenom, String email,
            String telephone, String specialite, String typeContrat, int heuresContractuellesSemaine,
            List<Disponibilite> disponibilites, boolean estActif, List<String> competencesModulesIds) {}
    public record FiliereData(String id, String codeFiliere, String intitule, String cycle, String description) {}
    public record OptionData(String id, String codeOption, String intitule, String filiereId) {}
    public record GroupeData(String id, String codeGroupe, String filiereId, String optionId, int anneeEtude,
            int effectif, String delegueNom, String campusFixeId, String laboratoiresRequis) {}
    public record ModuleData(String id, String codeModule, String intitule, String filiereId, String semestre, int volumeHoraireTotal) {}
    public record ElementData(String id, String moduleId, String codeElement, String intitule, int volumeHoraire,
            String typeElement, boolean necessitePc, String typeSalleRequis) {}
    public record SeanceData(String id, String groupeId, String salleId, String enseignantId,
            String elementModuleId, String jourSemaine, String numeroCreneau, int spanSeances, String statutAffectation) {}
}
