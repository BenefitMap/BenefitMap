package com.benefitmap.backend.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

/**
 * Unified API response wrapper for all controllers.
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
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "ok", data, Instant.now());
    }
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null, Instant.now());
    }
}
