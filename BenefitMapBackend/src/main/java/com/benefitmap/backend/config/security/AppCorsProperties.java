package com.benefitmap.backend.config.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

/**
 * CORS 허용 오리진 프로퍼티
 * - app.cors.allowed-origins 에서 쉼표(,) 구분 목록을 바인딩
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.cors")
public class AppCorsProperties {

    /** 예: "http://localhost:5173,http://localhost:8080" */
    private String allowedOrigins;

    /** 쉼표 구분 문자열을 리스트로 변환 */
    public List<String> getAllowedOriginList() {
        if (allowedOrigins == null || allowedOrigins.isBlank()) return List.of();
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
