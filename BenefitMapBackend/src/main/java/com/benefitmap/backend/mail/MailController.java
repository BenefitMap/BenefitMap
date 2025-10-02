package com.benefitmap.backend.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    /** 브라우저 주소창에서 바로 테스트: /api/mail/test?to=you@gmail.com */
    @GetMapping("/test")
    public ResponseEntity<String> test(@RequestParam String to) {
        String subject = "BenefitMap 메일 테스트 (TEXT)";
        String body = "안녕하세요! 텍스트 메일 테스트입니다.";
        mailService.sendText(to, subject, body);
        return ResponseEntity.ok("SENT(TEXT) -> " + to);
    }

    /** 브라우저 주소창에서 바로 테스트: /api/mail/test-html?to=you@gmail.com */
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
}
