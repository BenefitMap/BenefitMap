package com.benefitmap.backend.web.payload;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload returned by /auth/refresh")
public record RefreshResult(
        @Schema(example = "true")
        boolean ok
) {}
