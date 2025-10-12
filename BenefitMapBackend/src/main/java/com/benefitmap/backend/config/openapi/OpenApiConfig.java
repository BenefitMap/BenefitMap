package com.benefitmap.backend.config.openapi;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

/**
 * OpenAPI 설정
 * - cookieAuth: ACCESS_TOKEN 쿠키 인증 스킴 등록
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Benefit Map API",
                version = "v1",
                description = "Google OIDC + JWT(cookie) 기반 API"
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local")
        },
        security = { @SecurityRequirement(name = "cookieAuth") }
)
@SecurityScheme(
        name = "cookieAuth",               // 인증 이름
        type = SecuritySchemeType.APIKEY,  // 쿠키 인증 = APIKEY 타입
        in = SecuritySchemeIn.COOKIE,
        paramName = "ACCESS_TOKEN"         // 쿠키 키 이름
)
public class OpenApiConfig {}
