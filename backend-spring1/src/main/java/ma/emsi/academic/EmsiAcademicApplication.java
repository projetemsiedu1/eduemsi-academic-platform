package ma.emsi.academic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class EmsiAcademicApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmsiAcademicApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("  EMSI ACADEMIC PLATFORM (UNIVORA) - BACKEND ACTIVE (8080)");
        System.out.println("  SWAGGER DOCS : http://localhost:8080/swagger-ui.html");
        System.out.println("  OR-TOOLS SOLVER & GEMINI FLASH AI ENGINES READY");
        System.out.println("==========================================================");
    }
}
