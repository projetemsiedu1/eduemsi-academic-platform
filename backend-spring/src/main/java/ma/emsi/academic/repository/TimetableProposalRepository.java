package ma.emsi.academic.repository;
import ma.emsi.academic.domain.solver.TimetableProposal;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TimetableProposalRepository extends JpaRepository<TimetableProposal, String> {}
