package com.benefitmap.backend.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

/**
 * 공통 API 응답 DTO
 * - success : 성공 여부
 * - message : 간단한 설명/에러 메시지
 * - data    : 응답 페이로드 (nullable)
 * - timestamp : 서버 시각
 */
public record ApiResponse<T>(
        @Schema(example = "true")
        boolean success,

        @Schema(example = "logout")
        String message,

        @Schema(nullable = true)
        T data,

        @Schema(type = "string", format = "date-time",
                example = "2025-09-24T13:31:40.436095Z")
        Instant timestamp
) {
    /** 성공 응답 (기본 메시지 = "ok") */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "ok", data, Instant.now());
    }

    /** 성공 응답 (커스텀 메시지) */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }

    /** 실패 응답 */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null, Instant.now());
    }
}
