package org.sankhya.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sankhyaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sankhya API")
                        .version("v1")
                        .description("Endpoints de produtos, pedidos e checkout"))
                // Base server (deixe "/" — seus paths já incluem /api/v1)
                .servers(List.of(new Server().url("/")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("sankhya")
                .pathsToMatch("/api/v1/**")
                .build();
    }
}
