package ma.emsi.academic.service;

import ma.emsi.academic.domain.enums.TypeContrat;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.enseignant.EnseignantDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EnseignantService {
    PageResponse<EnseignantDto> getAllEnseignants(TypeContrat typeContrat, Pageable pageable);
    List<EnseignantDto> getEnseignantsByContrat(TypeContrat typeContrat);
    EnseignantDto getEnseignantById(Long id);
}
