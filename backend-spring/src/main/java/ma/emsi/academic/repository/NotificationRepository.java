package ma.emsi.academic.repository;

import ma.emsi.academic.domain.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.destinataireUsername = :username " +
           "OR (n.destinataireUsername IS NULL AND (n.destinataireRole IS NULL OR n.destinataireRole = :role)) " +
           "ORDER BY n.dateEnvoi DESC")
    List<Notification> findForUser(@Param("username") String username, @Param("role") String role);

    long countByDestinataireUsernameAndLuFalse(String username);
}
