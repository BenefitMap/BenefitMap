package com.benefitmap.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

/**
 * OpenAPI 기본 설정
 * - cookieAuth: ACCESS_TOKEN 쿠키로 인증
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "Benefit Map API", version = "v1",
                description = "Google OIDC + JWT(cookie) based API"),
        servers = { @Server(url = "http://localhost:8080", description = "Local") },
        security = { @SecurityRequirement(name = "cookieAuth") }
)
@SecurityScheme(
        name = "cookieAuth",               // @SecurityRequirement 에서 참조할 이름
        type = SecuritySchemeType.APIKEY,  // 쿠키 인증은 APIKEY 타입 + in=COOKIE 로 표현
        in = SecuritySchemeIn.COOKIE,
        paramName = "ACCESS_TOKEN"         // 쿠키 이름
)
public class OpenApiConfig {}
