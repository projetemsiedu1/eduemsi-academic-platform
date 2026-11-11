package ma.emsi.academic.service;

import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.groupe.CreateGroupeRequest;
import ma.emsi.academic.dto.groupe.GroupeDto;
import org.springframework.data.domain.Pageable;

public interface GroupeService {
    PageResponse<GroupeDto> getAllGroupes(Pageable pageable);
    PageResponse<GroupeDto> getGroupesByCampus(Long campusId, Pageable pageable);
    PageResponse<GroupeDto> getGroupesByFiliere(Long filiereId, Pageable pageable);
    GroupeDto getGroupeById(Long id);
    GroupeDto createGroupe(CreateGroupeRequest request);
    GroupeDto updateEffectif(Long id, int newEffectif);
    void deleteGroupe(Long id);
}
