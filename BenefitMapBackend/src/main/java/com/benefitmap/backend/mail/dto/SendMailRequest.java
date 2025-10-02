package com.benefitmap.backend.mail.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 메일 발송 요청 DTO
 *
 * - 컨트롤러/서비스 계층에서 메일 전송 API 호출 시 사용된다.
 * - Java 16+ record 로 정의하여 불변 객체로 활용.
 * - 유효성 검증 애너테이션(@Email, @NotBlank) 포함.
 */
public record SendMailRequest(

        /** 수신자 이메일 주소 (필수, 형식 검사 포함) */
        @Email @NotBlank String to,

        /** 메일 제목 (필수) */
        @NotBlank String subject,

        /** 메일 본문 내용 (필수) */
        @NotBlank String body,

        /** true = HTML 메일, false = 일반 텍스트 메일 */
        boolean html
) {}
