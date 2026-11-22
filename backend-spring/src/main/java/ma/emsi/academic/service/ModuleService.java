package ma.emsi.academic.service;

import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.module.CreateModuleRequest;
import ma.emsi.academic.dto.module.ModuleDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ModuleService {
    PageResponse<ModuleDto> getAllModules(Long filiereId, Pageable pageable);
    List<ModuleDto> getAllModulesList();
    ModuleDto getModuleById(Long id);
    List<ModuleDto> getModulesByFiliere(Long filiereId);
    ModuleDto createModule(CreateModuleRequest request);
    ModuleDto updateModule(Long id, CreateModuleRequest request);
    void deleteModule(Long id);
}
