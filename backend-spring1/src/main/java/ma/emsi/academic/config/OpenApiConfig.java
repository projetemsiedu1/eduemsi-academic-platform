package ma.emsi.academic.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EMSI Academic Platform (UNIVORA) - API REST")
                        .version("1.0.0")
                        .description("Plateforme académique et décisionnelle intégrée EMSI : Planification CP-SAT, Matching IA des jurys PFE, Registre d'assiduité et Contrôle RBAC.")
                        .contact(new Contact().name("Équipe EMSI Univora").email("direction.pedagogique@emsi.ma"))
                        .license(new License().name("Propriétaire EMSI").url("https://emsi.ma")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez votre jeton JWT généré via /api/v1/auth/login")));
    }
}
