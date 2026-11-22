package ma.emsi.academic.service;

import ma.emsi.academic.dto.campus.CampusDto;
import ma.emsi.academic.dto.campus.CreateCampusRequest;

import java.util.List;

public interface CampusService {
    List<CampusDto> getAllCampuses();
    CampusDto getCampusById(Long id);
    CampusDto createCampus(CreateCampusRequest request);
    CampusDto updateCampus(Long id, CreateCampusRequest request);
    void deleteCampus(Long id);
}
