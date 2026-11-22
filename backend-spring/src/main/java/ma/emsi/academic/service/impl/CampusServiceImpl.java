package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Campus;
import ma.emsi.academic.dto.campus.CampusDto;
import ma.emsi.academic.dto.campus.CreateCampusRequest;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.CampusRepository;
import ma.emsi.academic.service.CampusService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampusServiceImpl implements CampusService {

    private final CampusRepository campusRepository;

    @Override
    public List<CampusDto> getAllCampuses() {
        return campusRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CampusDto getCampusById(Long id) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus introuvable avec l'ID : " + id));
        return mapToDto(campus);
    }

    @Override
    @Transactional
    public CampusDto createCampus(CreateCampusRequest request) {
        if (campusRepository.existsByNom(request.getNom())) {
            throw new IllegalArgumentException("Un campus avec le nom '" + request.getNom() + "' existe déjà.");
        }

        Campus campus = Campus.builder()
                .nom(request.getNom())
                .adresse(request.getAdresse())
                .ville(request.getVille() != null ? request.getVille() : "Marrakech")
                .build();

        return mapToDto(campusRepository.save(campus));
    }

    @Override
    @Transactional
    public CampusDto updateCampus(Long id, CreateCampusRequest request) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus introuvable avec l'ID : " + id));

        if (!campus.getNom().equalsIgnoreCase(request.getNom()) &&
                campusRepository.existsByNom(request.getNom())) {
            throw new IllegalArgumentException("Un campus avec le nom '" + request.getNom() + "' existe déjà.");
        }

        campus.setNom(request.getNom());
        campus.setAdresse(request.getAdresse());
        if (request.getVille() != null) campus.setVille(request.getVille());

        return mapToDto(campusRepository.save(campus));
    }

    @Override
    @Transactional
    public void deleteCampus(Long id) {
        if (!campusRepository.existsById(id)) {
            throw new ResourceNotFoundException("Campus introuvable avec l'ID : " + id);
        }
        campusRepository.deleteById(id);
    }

    private CampusDto mapToDto(Campus c) {
        return CampusDto.builder()
                .id(c.getId())
                .nom(c.getNom())
                .adresse(c.getAdresse())
                .ville(c.getVille())
                .nombreSalles(c.getSalles() != null ? c.getSalles().size() : 0)
                .nombreGroupes(c.getGroupesAssignes() != null ? c.getGroupesAssignes().size() : 0)
                .build();
    }
}
