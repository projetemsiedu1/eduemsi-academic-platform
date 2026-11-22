package ma.emsi.academic.dto.absence;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record BilanAbsenceEtudiantDto(
        Long etudiantId,
        String matricule,
        String nomComplet,
        String groupeNom,
        String filiereNom,
        String campusNom,
        BigDecimal totalHeuresModuleSemestre,
        BigDecimal cumulHeuresAbsence,
        Double pourcentageAbsence,
        Boolean estRadieExamen,
        Integer nombreSeancesAbsentes,
        Integer nombreSeancesJustifiees,
        List<AbsenceDto> historiqueAbsences,
        List<ModuleAbsenceSyntheseDto> syntheseModules
) {
    @Builder
    public record ModuleAbsenceSyntheseDto(
            String moduleCode,
            String moduleNom,
            Double totalHeures,
            Double heuresAbsence,
            Double pourcentage,
            Boolean seuilDepasse,
            Integer absencesJustifiees,
            Integer absencesNonJustifiees
    ) {}
}
