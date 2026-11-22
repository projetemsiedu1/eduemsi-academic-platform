package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import ma.emsi.academic.domain.entity.Filiere;
import ma.emsi.academic.domain.entity.Module;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.module.CreateModuleRequest;
import ma.emsi.academic.dto.module.ElementModuleDto;
import ma.emsi.academic.dto.module.ModuleDto;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.FiliereRepository;
import ma.emsi.academic.repository.ModuleRepository;
import ma.emsi.academic.service.ModuleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final FiliereRepository filiereRepository;

    @Override
    public PageResponse<ModuleDto> getAllModules(Long filiereId, Pageable pageable) {
        Page<Module> page = filiereId != null
                ? moduleRepository.findByFiliereId(filiereId, pageable)
                : moduleRepository.findAll(pageable);

        List<ModuleDto> content = page.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PageResponse.from(page, content);
    }

    @Override
    public List<ModuleDto> getAllModulesList() {
        return moduleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ModuleDto getModuleById(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'ID : " + id));
        return mapToDto(module);
    }

    @Override
    public List<ModuleDto> getModulesByFiliere(Long filiereId) {
        return moduleRepository.findByFiliereId(filiereId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ModuleDto createModule(CreateModuleRequest request) {
        if (moduleRepository.existsByCodeModule(request.getCodeModule())) {
            throw new IllegalArgumentException("Un module avec le code '" + request.getCodeModule() + "' existe déjà.");
        }

        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable avec l'ID : " + request.getFiliereId()));

        Module module = Module.builder()
                .codeModule(request.getCodeModule().toUpperCase())
                .intitule(request.getIntitule())
                .semestre(request.getSemestre() != null ? request.getSemestre() : "S1")
                .volumeHoraireTotal(request.getVolumeHoraireTotal() != null ? request.getVolumeHoraireTotal() : 90)
                .filiere(filiere)
                .build();

        return mapToDto(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public ModuleDto updateModule(Long id, CreateModuleRequest request) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'ID : " + id));

        if (!module.getCodeModule().equalsIgnoreCase(request.getCodeModule()) &&
                moduleRepository.existsByCodeModule(request.getCodeModule())) {
            throw new IllegalArgumentException("Un module avec le code '" + request.getCodeModule() + "' existe déjà.");
        }

        if (!module.getFiliere().getId().equals(request.getFiliereId())) {
            Filiere filiere = filiereRepository.findById(request.getFiliereId())
                    .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable avec l'ID : " + request.getFiliereId()));
            module.setFiliere(filiere);
        }

        module.setCodeModule(request.getCodeModule().toUpperCase());
        module.setIntitule(request.getIntitule());
        if (request.getSemestre() != null) module.setSemestre(request.getSemestre());
        if (request.getVolumeHoraireTotal() != null) module.setVolumeHoraireTotal(request.getVolumeHoraireTotal());

        return mapToDto(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public void deleteModule(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Module introuvable avec l'ID : " + id);
        }
        moduleRepository.deleteById(id);
    }

    private ModuleDto mapToDto(Module m) {
        List<ElementModuleDto> elements = m.getElements() != null
                ? m.getElements().stream()
                .map(elem -> ElementModuleDto.builder()
                        .id(elem.getId())
                        .codeElement(elem.getCodeElement())
                        .intitule(elem.getIntitule())
                        .volumeHoraire(elem.getVolumeHoraire())
                        .typeSalleRequis(elem.getTypeSalleRequis())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return ModuleDto.builder()
                .id(m.getId())
                .filiereId(m.getFiliere() != null ? m.getFiliere().getId() : null)
                .filiereCode(m.getFiliere() != null ? m.getFiliere().getCode() : null)
                .filiereLibelle(m.getFiliere() != null ? m.getFiliere().getLibelle() : null)
                .codeModule(m.getCodeModule())
                .intitule(m.getIntitule())
                .semestre(m.getSemestre())
                .volumeHoraireTotal(m.getVolumeHoraireTotal())
                .elements(elements)
                .build();
    }
}
