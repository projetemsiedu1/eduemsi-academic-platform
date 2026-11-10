package ma.emsi.academic.service;

import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.filiere.CreateFiliereRequest;
import ma.emsi.academic.dto.filiere.FiliereDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FiliereService {
    PageResponse<FiliereDto> getAllFilieres(Pageable pageable);
    List<FiliereDto> getAllFilieresList();
    FiliereDto getFiliereById(Long id);
    FiliereDto createFiliere(CreateFiliereRequest request);
    FiliereDto updateFiliere(Long id, CreateFiliereRequest request);
    void deleteFiliere(Long id);
}
