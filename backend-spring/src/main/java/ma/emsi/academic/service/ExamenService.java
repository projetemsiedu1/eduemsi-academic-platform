package ma.emsi.academic.service;

import ma.emsi.academic.dto.examen.CreateExamenRequest;
import ma.emsi.academic.dto.examen.ExamenDto;

import java.time.LocalDate;
import java.util.List;

public interface ExamenService {
    List<ExamenDto> getAllExamens();
    List<ExamenDto> getExamensByDate(LocalDate date);
    List<ExamenDto> getExamensByGroupe(Long groupeId);
    ExamenDto getExamenById(Long id);
    ExamenDto createExamen(CreateExamenRequest request);
    ExamenDto updateExamen(Long id, CreateExamenRequest request);
    void deleteExamen(Long id);
}
