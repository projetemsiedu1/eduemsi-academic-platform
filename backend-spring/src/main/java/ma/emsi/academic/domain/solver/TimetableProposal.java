package ma.emsi.academic.domain.solver;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name = "planning_proposals") @Getter @Setter
public class TimetableProposal {
    @Id @Column(length = 36) private String id;
    @Version private Long version;
    @Column(nullable = false) private String owner;
    @Column(nullable = false, length = 20) private String state;
    @Column(nullable = false) private Instant expiresAt;
    @Column(nullable = false, length = 64) private String fingerprint;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") private String solutionJson;
}
