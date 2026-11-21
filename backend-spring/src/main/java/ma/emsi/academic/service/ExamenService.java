package ma.emsi.academic.service;

import ma.emsi.academic.dto.examen.*;

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

    // Distribution des places & convocations
    List<ExamenAffectationDto> distribuerPlacesHeterogene(Long examenId, boolean unSurDeux);
    List<ExamenAffectationDto> getPlacesParExamen(Long examenId);
    List<ConvocationEtudiantDto> getConvocationsEtudiant(String emailOuUsername);
    List<ConvocationEtudiantDto> getConvocationsEtudiantById(Long etudiantId);

    // Ordonnancement automatique avec contraintes (Jours, Modules/Jour, Décalage)
    List<ExamenDto> autoPlanifierExamens(AutoPlanificationExamensRequest request);
}
