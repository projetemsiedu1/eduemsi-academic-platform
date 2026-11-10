package ma.emsi.academic.service;

import ma.emsi.academic.dto.absence.AbsenceDto;
import ma.emsi.academic.dto.absence.EtudiantAlerteAbsenceDto;
import ma.emsi.academic.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AbsenceService {
    PageResponse<AbsenceDto> getAllAbsences(Pageable pageable);
    List<AbsenceDto> getAbsencesByEtudiant(Long etudiantId);
    List<EtudiantAlerteAbsenceDto> getEtudiantsSeuilCritique();
    AbsenceDto enregistrerAbsence(Long etudiantId, Long seanceId, String motif);
    AbsenceDto justifierAbsence(Long absenceId, String motif, boolean justifiee);
    void deleteAbsence(Long absenceId);
}
