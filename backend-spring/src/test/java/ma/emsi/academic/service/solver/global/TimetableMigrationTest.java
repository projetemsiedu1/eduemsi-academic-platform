package ma.emsi.academic.service.solver.global;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import java.sql.*;
import static org.junit.jupiter.api.Assertions.*;

class TimetableMigrationTest {
    @Test void additiveMysqlMigrationCreatesOnlyPlanningTables() throws Exception {
        try (var c=DriverManager.getConnection("jdbc:h2:mem:migration_solver;MODE=MySQL;DB_CLOSE_DELAY=-1","sa","")) {
            var statement=c.createStatement();
            for(String table:new String[]{"groupes","elements_module","enseignants","modules"}) statement.execute("CREATE TABLE "+table+" (id BIGINT PRIMARY KEY)");
            ScriptUtils.executeSqlScript(c,new ClassPathResource("db/migration/mysql/V4__planning_solver_proposals.sql"));
            for(String table:new String[]{"planning_requirements","planning_qualifications","planning_proposals"}) try(var rows=statement.executeQuery("SELECT COUNT(*) FROM "+table)){assertTrue(rows.next());assertEquals(0,rows.getInt(1));}
            statement.execute("INSERT INTO groupes VALUES (1)");statement.execute("INSERT INTO elements_module VALUES (1)");statement.execute("INSERT INTO enseignants VALUES (1)");
            assertThrows(SQLException.class,()->statement.execute("INSERT INTO planning_requirements(groupe_id,element_id,enseignant_id,weekly_sessions) VALUES (1,1,1,0)"));
            try(var rows=statement.executeQuery("SELECT COUNT(*) FROM groupes")){rows.next();assertEquals(1,rows.getInt(1));}
        }
    }
}
