package com.benefitmap.backend.mail.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendMailRequest(
        @Email @NotBlank String to,
        @NotBlank String subject,
        @NotBlank String body,
        boolean html // true면 HTML 본문으로 전송
) {}
