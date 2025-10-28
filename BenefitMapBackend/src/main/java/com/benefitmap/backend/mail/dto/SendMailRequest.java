package com.benefitmap.backend.mail.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * 프론트가 /api/mail/send 로 POST 할 때 보내는 JSON 바디.
 *
 * {
 *   "to": "user@example.com",
 *   "subject": "[BenefitMap] ...",
 *   "body": "본문 텍스트 또는 HTML",
 *   "html": true
 * }
 */
@Builder
public record SendMailRequest(
        @Email @NotBlank String to,
        @NotBlank String subject,
        @NotBlank String body,
        boolean html
) {}
