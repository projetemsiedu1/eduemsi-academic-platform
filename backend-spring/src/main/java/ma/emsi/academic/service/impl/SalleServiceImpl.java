package ma.emsi.academic.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.emsi.academic.domain.entity.Campus;
import ma.emsi.academic.domain.entity.Salle;
import ma.emsi.academic.domain.enums.TypeSalle;
import ma.emsi.academic.dto.common.PageResponse;
import ma.emsi.academic.dto.salle.CreateSalleRequest;
import ma.emsi.academic.dto.salle.SalleDto;
import ma.emsi.academic.exception.BusinessRuleException;
import ma.emsi.academic.exception.ResourceNotFoundException;
import ma.emsi.academic.repository.CampusRepository;
import ma.emsi.academic.repository.SalleRepository;
import ma.emsi.academic.service.SalleService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalleServiceImpl implements SalleService {

    private final SalleRepository salleRepository;
    private final CampusRepository campusRepository;

    @Override
    public PageResponse<SalleDto> getAllSalles(Pageable pageable) {
        Page<Salle> page = salleRepository.findAll(pageable);
        List<SalleDto> dtoList = page.getContent().stream().map(this::mapToDto).toList();
        return PageResponse.from(page, dtoList);
    }

    @Override
    public PageResponse<SalleDto> getSallesByCampus(Long campusId, Pageable pageable) {
        if (!campusRepository.existsById(campusId)) {
            throw new ResourceNotFoundException("Campus introuvable avec l'identifiant : " + campusId);
        }
        Page<Salle> page = salleRepository.findByCampusId(campusId, pageable);
        List<SalleDto> dtoList = page.getContent().stream().map(this::mapToDto).toList();
        return PageResponse.from(page, dtoList);
    }

    @Override
    public PageResponse<SalleDto> getSallesByType(TypeSalle typeSalle, Pageable pageable) {
        Page<Salle> page = salleRepository.findByTypeSalle(typeSalle, pageable);
        List<SalleDto> dtoList = page.getContent().stream().map(this::mapToDto).toList();
        return PageResponse.from(page, dtoList);
    }

    @Override
    public SalleDto getSalleById(Long id) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable avec l'identifiant : " + id));
        return mapToDto(salle);
    }

    @Override
    @Transactional
    public SalleDto createSalle(CreateSalleRequest request) {
        if (salleRepository.existsByCodeSalle(request.getCodeSalle())) {
            throw new BusinessRuleException("Une salle avec le code '" + request.getCodeSalle() + "' existe déjà.");
        }

        Campus campus = campusRepository.findById(request.getCampusId())
                .orElseThrow(() -> new ResourceNotFoundException("Campus introuvable avec l'identifiant : " + request.getCampusId()));

        Salle salle = Salle.builder()
                .campus(campus)
                .codeSalle(request.getCodeSalle().trim())
                .typeSalle(request.getTypeSalle())
                .capacite(request.getCapacite())
                .nombrePcOperationnels(request.getNombrePcOperationnels() != null ? request.getNombrePcOperationnels() : 0)
                .specsEquipements(request.getSpecsEquipements())
                .horairesOuverture(request.getHorairesOuverture() != null ? request.getHorairesOuverture() : "Séances S1 à S6 (08h30 - 18h45)")
                .estDisponible(request.getEstDisponible() != null ? request.getEstDisponible() : true)
                .build();

        return mapToDto(salleRepository.save(salle));
    }

    @Override
    @Transactional
    public SalleDto updateSalle(Long id, CreateSalleRequest request) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable avec l'identifiant : " + id));

        if (!salle.getCodeSalle().equalsIgnoreCase(request.getCodeSalle().trim()) &&
                salleRepository.existsByCodeSalle(request.getCodeSalle().trim())) {
            throw new BusinessRuleException("Une autre salle possède déjà le code '" + request.getCodeSalle() + "'.");
        }

        Campus campus = campusRepository.findById(request.getCampusId())
                .orElseThrow(() -> new ResourceNotFoundException("Campus introuvable avec l'identifiant : " + request.getCampusId()));

        salle.setCampus(campus);
        salle.setCodeSalle(request.getCodeSalle().trim());
        salle.setTypeSalle(request.getTypeSalle());
        salle.setCapacite(request.getCapacite());
        salle.setNombrePcOperationnels(request.getNombrePcOperationnels());
        salle.setSpecsEquipements(request.getSpecsEquipements());
        salle.setHorairesOuverture(request.getHorairesOuverture());
        salle.setEstDisponible(request.getEstDisponible());

        return mapToDto(salleRepository.save(salle));
    }

    @Override
    @Transactional
    public void deleteSalle(Long id) {
        if (!salleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Salle introuvable avec l'identifiant : " + id);
        }
        salleRepository.deleteById(id);
    }

    @Override
    @Transactional
    public List<SalleDto> importerSallesFromExcel(InputStream inputStream, Long campusIdDefaut) {
        Campus campus = campusRepository.findById(campusIdDefaut)
                .orElseThrow(() -> new ResourceNotFoundException("Campus cible introuvable : " + campusIdDefaut));

        List<Salle> sallesCrees = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Ignorer la ligne d'en-tête
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (row.getCell(0) == null) continue;

                String codeSalle = getCellValueAsString(row.getCell(0));
                if (codeSalle.isBlank()) continue;

                String typeSalleStr = row.getCell(1) != null ? getCellValueAsString(row.getCell(1)).trim().toUpperCase() : "STANDARD";
                TypeSalle typeSalle;
                try {
                    typeSalle = TypeSalle.valueOf(typeSalleStr);
                } catch (IllegalArgumentException e) {
                    typeSalle = TypeSalle.STANDARD;
                }

                int capacite = row.getCell(2) != null ? (int) row.getCell(2).getNumericCellValue() : 35;
                int nbPc = row.getCell(3) != null ? (int) row.getCell(3).getNumericCellValue() : 0;
                String specs = row.getCell(4) != null ? getCellValueAsString(row.getCell(4)) : "";

                // Vérifier ou mettre à jour
                Salle salle = salleRepository.findByCodeSalle(codeSalle).orElse(
                        Salle.builder()
                                .campus(campus)
                                .codeSalle(codeSalle)
                                .typeSalle(typeSalle)
                                .capacite(capacite)
                                .nombrePcOperationnels(nbPc)
                                .specsEquipements(specs)
                                .estDisponible(true)
                                .build()
                );
                salle.setCapacite(capacite);
                salle.setNombrePcOperationnels(nbPc);
                salle.setTypeSalle(typeSalle);
                salle.setSpecsEquipements(specs);

                sallesCrees.add(salleRepository.save(salle));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la lecture du fichier Excel des salles", e);
            throw new BusinessRuleException("Erreur de parsing du fichier Excel des salles : " + e.getMessage());
        }

        return sallesCrees.stream().map(this::mapToDto).toList();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private SalleDto mapToDto(Salle salle) {
        return SalleDto.builder()
                .id(salle.getId())
                .campusId(salle.getCampus() != null ? salle.getCampus().getId() : null)
                .campusNom(salle.getCampus() != null ? salle.getCampus().getNom() : null)
                .codeSalle(salle.getCodeSalle())
                .typeSalle(salle.getTypeSalle())
                .capacite(salle.getCapacite())
                .nombrePcOperationnels(salle.getNombrePcOperationnels())
                .specsEquipements(salle.getSpecsEquipements())
                .horairesOuverture(salle.getHorairesOuverture())
                .estDisponible(salle.getEstDisponible())
                .build();
    }
}
