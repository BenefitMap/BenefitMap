package com.benefitmap.backend.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 메일 발송 컨트롤러
 *
 * - 개발/테스트 단계에서 브라우저 주소창으로 간단히 메일 발송 기능을 검증할 수 있도록 작성된 컨트롤러
 * - MailService 를 주입받아 텍스트/HTML 메일 발송을 실행
 * - 실제 운영 환경에서는 Service 계층과 연동하여 알림 메일, D-3 안내 메일 등을 발송하는 구조로 확장 가능
 */
@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    /**
     * 단순 텍스트 메일 발송 테스트
     *
     * 예: 브라우저 주소창 → /api/mail/test?to=you@gmail.com
     * - subject: "BenefitMap 메일 테스트 (TEXT)"
     * - body: 단순 텍스트 문자열
     */
    @GetMapping("/test")
    public ResponseEntity<String> test(@RequestParam String to) {
        String subject = "BenefitMap 메일 테스트 (TEXT)";
        String body = "안녕하세요! 텍스트 메일 테스트입니다.";
        mailService.sendText(to, subject, body);
        return ResponseEntity.ok("SENT(TEXT) -> " + to);
    }

    /**
     * HTML 메일 발송 테스트
     *
     * 예: 브라우저 주소창 → /api/mail/test-html?to=you@gmail.com
     * - HTML 태그 포함된 본문 전송
     * - SMTP 서버가 HTML 콘텐츠를 정상적으로 처리하는지 확인 가능
     */
    @GetMapping("/test-html")
    public ResponseEntity<String> testHtml(@RequestParam String to) {
        String subject = "BenefitMap 메일 테스트 (HTML)";
        String html = """
            <div style="font-family:system-ui,Segoe UI,Roboto,Apple SD Gothic Neo;">
              <h2>✅ HTML 메일 테스트</h2>
              <p>이 메일이 보이면 SMTP 설정이 정상입니다.</p>
            </div>
        """;
        mailService.sendHtml(to, subject, html);
        return ResponseEntity.ok("SENT(HTML) -> " + to);
    }

    /**
     * "복지 신청 D-3" 안내 메일 발송 테스트
     *
     * 예: 브라우저 주소창 → /api/mail/test-d3?to=you@gmail.com
     * - 실제 알림 메일과 유사한 HTML 템플릿 사용
     * - 정책 마감일 3일 전을 가정한 알림 내용 포함
     * - Demo 링크 포함 (실제 운영 환경에서는 정책 상세 페이지로 연결)
     */
    @GetMapping("/test-d3")
    public ResponseEntity<String> testD3(@RequestParam String to) {
        String subject = "[BenefitMap] (테스트) 복지 신청 D-3 알림";
        String html = """
            <div style="font-family:system-ui,Segoe UI,Roboto,Apple SD Gothic Neo; max-width:600px; margin:20px auto; border:1px solid #eee; border-radius:10px; padding:20px;">
              <h2 style="color:#333;">📢 복지 신청 D-3 알림 (테스트용)</h2>
              <p><b>테스트 복지 정책명</b>의 신청 마감이 <b>D-3</b> 남았습니다.</p>
              <p>마감일: <b>2025-12-31</b></p>
              <a href="https://benefitmap.com/policy/demo"
                 style="display:inline-block;padding:10px 14px;background:#4CAF50;color:white;border-radius:8px;text-decoration:none;">
                자세히 보기 (Demo)
              </a>
              <p style="color:#888;font-size:12px;margin-top:18px;">본 메일은 BenefitMap 테스트 환경에서 발송된 미리보기입니다.</p>
            </div>
        """;
        mailService.sendHtml(to, subject, html);
        return ResponseEntity.ok("SENT(TEST D-3) -> " + to);
    }
}
