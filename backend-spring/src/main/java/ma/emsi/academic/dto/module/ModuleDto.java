package ma.emsi.academic.dto.module;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDto {
    private Long id;
    private Long filiereId;
    private String filiereCode;
    private String filiereLibelle;
    private String codeModule;
    private String intitule;
    private String semestre;
    private Integer volumeHoraireTotal;
    private List<ElementModuleDto> elements;
}
