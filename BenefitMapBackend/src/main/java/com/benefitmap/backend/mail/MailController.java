package com.benefitmap.backend.mail;

import com.benefitmap.backend.mail.dto.SendMailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 메일 전송 API
 *
 * /api/mail/deadline-notification
 *   - permitAll() (SecurityConfig에서 허용해야 함)
 *   - 테스트/디데이 자동 발송용
 *
 * /api/mail/send
 *   - authenticated()
 *   - 현재 로그인한 사용자 본인 이메일로만 보내도록 제한
 */
@Slf4j
@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    /**
     * 실제로는 너희 프로젝트의 Principal(예: JwtUserPrincipal, AuthUser 등)을 써야 한다.
     * 여기 예시는 최소한 이메일만 있는 얇은 형태로 둔 거라 그대로 쓰면 안 되고,
     * 네 프로젝트에 맞게 교체해야 한다.
     */
    public static class CustomUserPrincipal {
        private final Long id;
        private final String email;
        public CustomUserPrincipal(Long id, String email) {
            this.id = id;
            this.email = email;
        }
        public Long getId() { return id; }
        public String getEmail() { return email; }
    }

    /**
     * 1) 누구나 호출 가능하게 둘 엔드포인트
     *    - 테스트 "지금 보내기" 버튼에서 호출
     *    - 디데이 알림 자동 발송(스케줄러)에서도 재사용 가능
     *
     * 요청 바디 예:
     * {
     *   "to": "user@gmail.com",
     *   "subject": "[테스트] ...",
     *   "body": "내용",
     *   "html": false
     * }
     */
    @PostMapping("/deadline-notification")
    public ResponseEntity<?> sendDeadlineNotification(
            @RequestBody SendMailRequest request
    ) {
        try {
            log.info("⏰ [/api/mail/deadline-notification] to={}, subject={}",
                    request.to(), request.subject());

            mailService.sendMail(request);

            return ResponseEntity.ok(jsonOk("deadline_mail_sent"));
        } catch (MailException e) {
            log.error("마감 임박 테스트 메일 전송 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(jsonError("deadline_mail_failed"));
        }
    }

    /**
     * 2) 인증된 사용자 전용
     *    - 로그인한 본인 이메일로만 보낼 수 있도록 검사
     *
     * SecurityConfig에서 /api/mail/send 는 authenticated() 로 막아둬야 한다.
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMailToSelf(
            @RequestBody SendMailRequest request,
            @AuthenticationPrincipal CustomUserPrincipal me
            // ↑ 실제 Principal 타입으로 바꿔줘.
    ) {
        // 1. 인증체크
        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(jsonError("unauthorized"));
        }

        String loginEmail = me.getEmail();
        if (loginEmail == null || loginEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(jsonError("missing_email"));
        }

        // 2. 요청의 수신자(to)가 로그인한 본인인지 확인
        if (!loginEmail.equalsIgnoreCase(request.to())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(jsonError("forbidden"));
        }

        // 3. 발송
        try {
            log.info("📧 [/api/mail/send] userId={}, to={}, subject={}",
                    me.getId(), request.to(), request.subject());

            mailService.sendMail(request);

            return ResponseEntity.ok(jsonOk("ok"));
        } catch (MailException e) {
            log.error("메일 전송 실패 (/send): {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(jsonError("mail_send_failed"));
        }
    }

    /* ===== 내부 응답 유틸 ===== */

    private static String jsonOk(String msg) {
        return "{\"status\":\"" + msg + "\"}";
    }

    private static String jsonError(String msg) {
        return "{\"error\":\"" + msg + "\"}";
    }
}
