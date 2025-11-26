package com.benefitmap.backend.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * /auth/refresh 응답 DTO
 * - ok : 재발급 성공 여부
 */
@Schema(description = "Payload returned by /auth/refresh")
public record RefreshResult(
        @Schema(example = "true")
        boolean ok
) {}
