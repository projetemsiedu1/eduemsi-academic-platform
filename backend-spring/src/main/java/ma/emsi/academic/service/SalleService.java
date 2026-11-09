package ma.emsi.academic.service;

import ma.emsi.academic.domain.enums.TypeSalle;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.salle.CreateSalleRequest;
import ma.emsi.academic.dto.salle.SalleDto;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

public interface SalleService {
    PageResponse<SalleDto> getAllSalles(Pageable pageable);
    PageResponse<SalleDto> getSallesByCampus(Long campusId, Pageable pageable);
    PageResponse<SalleDto> getSallesByType(TypeSalle typeSalle, Pageable pageable);
    SalleDto getSalleById(Long id);
    SalleDto createSalle(CreateSalleRequest request);
    SalleDto updateSalle(Long id, CreateSalleRequest request);
    void deleteSalle(Long id);
    List<SalleDto> importerSallesFromExcel(InputStream inputStream, Long campusIdDefaut);
}
