package ma.emsi.academic.service;

import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.etudiant.CreateEtudiantRequest;
import ma.emsi.academic.dto.etudiant.EtudiantDto;
import org.springframework.data.domain.Pageable;

public interface EtudiantService {
    PageResponse<EtudiantDto> getAllEtudiants(Pageable pageable);
    PageResponse<EtudiantDto> getEtudiantsByGroupe(Long groupeId, Pageable pageable);
    EtudiantDto getEtudiantById(Long id);
    EtudiantDto createEtudiant(CreateEtudiantRequest request);
    EtudiantDto updateEtudiant(Long id, CreateEtudiantRequest request);
    void deleteEtudiant(Long id);
}
