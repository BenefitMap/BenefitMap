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
 * 메일 전송 API 컨트롤러
 *
 * 이 컨트롤러는 BenefitMap이 발송하는 알림/테스트 메일을 담당한다.
 *
 * [핵심 엔드포인트]
 *
 * 1) POST /api/mail/deadline-notification
 *    - (보안 정책상) 공개로 둘 수 있는 엔드포인트
 *      → 예: 관리자 테스트 "지금 보내기" 버튼, 혹은 서버의 스케줄러(Task)에서 직접 호출
 *    - 임박한 마감일(D-day) 알림용 메일을 즉시 보낸다.
 *    - SecurityConfig에서 permitAll()로 열어두는 걸 전제로 한다.
 *
 * 2) POST /api/mail/send
 *    - 로그인한 사용자만 호출 가능 (authenticated())
 *    - 현재 로그인한 본인 이메일 주소로만 보낼 수 있다.
 *      즉, 누가 다른 사람 이메일로 임의 발송 못 하게 막는다.
 *    - SecurityConfig에서 authenticated() 설정 필요.
 *
 * [에러 처리]
 * - MailService.sendMail() 내부에서 발생한 MailException 등은
 *   적절한 HTTP 상태코드(500 등)로 내려준 뒤, 단순 JSON 문자열을 응답한다.
 *
 * ※ 실제 서비스에서는 ApiResponse<T> 같은 공통 래퍼를 써도 되고,
 *   여기처럼 단순 문자열 JSON을 리턴해도 된다.
 */
@Slf4j
@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    /**
     * 현재 로그인한 사용자를 표현할 (예시용) Principal 클래스.
     *
     * - 실제 서비스에선 SecurityContext에 올라가는 Principal(예: JwtUserPrincipal, AuthUser 등)
     *   타입이 이미 있을 것이다.
     * - 그 타입에는 userId, email, role 등이 들어있을 가능성이 높다.
     *
     * 여기서는 "email이 무엇인지" 정도만 필요하므로, 간단한 DTO 느낌으로 준다.
     * 그대로 쓰지 말고 실제 프로젝트의 Principal로 교체할 것.
     */
    public static class CustomUserPrincipal {
        private final Long id;
        private final String email;
        public CustomUserPrincipal(Long id, String email) {
            this.id = id;
            this.email = email;
        }
        public Long getId()   { return id; }
        public String getEmail() { return email; }
    }

    // ========================================================================
    // 1. 마감 임박/디데이 알림 메일 전송 (공개 엔드포인트)
    // ========================================================================

    /**
     * 마감 임박(D-day) 알림 메일 전송
     *
     * 사용처:
     * - 백오피스(관리자 화면)의 "테스트 발송" 버튼
     * - 또는 서버 내부의 스케줄러(예: 매일 09:00마다)에서 호출
     *
     * 요청 바디(JSON) 예:
     * {
     *   "to": "user@gmail.com",
     *   "subject": "[BenefitMap] ~~ 마감 임박 안내",
     *   "body": "<b>D-3!</b> ...",
     *   "html": true
     * }
     *
     * 동작 흐름:
     *  1) 요청 로그 남김
     *  2) MailService.sendMail() 호출
     *  3) 성공 시 200 OK + {"status":"deadline_mail_sent"}
     *  4) 전송 실패 시 500 + {"error":"deadline_mail_failed"}
     *
     * 보안:
     * - 실제 운영에서는 누구나 호출 가능한 상태로 두기보다는
     *   내부에서만 호출하게 하거나, 관리자 전용 토큰 검증 등을 추가해야 한다.
     *   지금은 과제/데모용으로 permitAll() 가정.
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
            // SMTP 에러 등 전송 실패
            log.error("마감 임박 테스트 메일 전송 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(jsonError("deadline_mail_failed"));
        }
    }

    // ========================================================================
    // 2. 로그인한 사용자 본인에게 메일 보내기 (보안 검증 포함)
    // ========================================================================

    /**
     * 로그인한 사용자에게 자기 자신 이메일로 메일 보내기
     *
     * 엔드포인트: POST /api/mail/send
     * Security:
     *   - SecurityConfig에서 authenticated() 또는 @PreAuthorize로 보호
     *   - 여기서는 @PreAuthorize("isAuthenticated()") 사용
     *
     * 처리 흐름:
     *  1) SecurityContext에서 현재 사용자 정보(@AuthenticationPrincipal) 가져온다.
     *  2) 본인 이메일(loginEmail)을 추출한다.
     *  3) 요청 JSON의 "to" 필드가 loginEmail과 동일한지 확인한다.
     *     → 다르면 FORBIDDEN (본인 메일로만 보내게 강제)
     *  4) MailService.sendMail() 호출
     *  5) 성공 시 200 OK + {"status":"ok"}
     *     실패 시 500 + {"error":"mail_send_failed"}
     *
     * 응답 형태는 간단한 문자열 JSON이지만,
     * 실제 프로젝트에서는 ApiResponse<T> 같은 공통 응답 포맷을 써도 된다.
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMailToSelf(
            @RequestBody SendMailRequest request,
            @AuthenticationPrincipal CustomUserPrincipal me
            // ↑ 실제 Principal 타입(예: JwtUserPrincipal 등)으로 교체할 것
    ) {
        // 1) 인증 여부 확인
        if (me == null) {
            // SecurityContext에 Principal 자체가 없다면 로그인 안 된 상태로 본다.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(jsonError("unauthorized"));
        }

        // 2) 로그인 사용자의 이메일 정보 확인
        String loginEmail = me.getEmail();
        if (loginEmail == null || loginEmail.isBlank()) {
            // 이 경우는 계정에 이메일이 저장 안 된 특수 상황 (거의 없어야 정상)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(jsonError("missing_email"));
        }

        // 3) 요청 바디의 to()가 본인 이메일과 일치하는지 검사
        if (!loginEmail.equalsIgnoreCase(request.to())) {
            // 다른 사람 메일 주소로 임의 발송을 막는다.
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(jsonError("forbidden"));
        }

        // 4) 실제 전송 시도
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

    // ========================================================================
    // 내부 유틸 (간단 JSON 문자열)
    // ========================================================================

    /**
     * 성공 응답용 단순 JSON 문자열 생성
     * ex) {"status":"ok"}
     */
    private static String jsonOk(String msg) {
        return "{\"status\":\"" + msg + "\"}";
    }

    /**
     * 에러 응답용 단순 JSON 문자열 생성
     * ex) {"error":"forbidden"}
     */
    private static String jsonError(String msg) {
        return "{\"error\":\"" + msg + "\"}";
    }
}
