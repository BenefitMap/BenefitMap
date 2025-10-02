package com.benefitmap.backend.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * 메일 발송 서비스
 *
 * - Spring Boot의 JavaMailSender 사용
 * - 단순 텍스트 메일과 HTML 메일 발송을 지원
 * - 예외 발생 시 RuntimeException으로 래핑하여 상위 컨트롤러에서 처리 가능
 */
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    /**
     * 단순 텍스트 메일 발송
     *
     * @param to        수신자 이메일
     * @param subject   메일 제목
     * @param textBody  메일 본문 (text/plain)
     *
     * - MimeMessageHelper 의 두 번째 파라미터 false → 일반 텍스트로 전송
     * - 한글 깨짐 방지를 위해 UTF-8 지정
     */
    public void sendText(String to, String subject, String textBody) {
        try {
            MimeMessage mm = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mm, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, false); // false = text/plain
            mailSender.send(mm);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("메일(Text) 발송 실패: " + e.getMessage(), e);
        }
    }

    /**
     * HTML 메일 발송
     *
     * @param to        수신자 이메일
     * @param subject   메일 제목
     * @param html      메일 본문 (HTML 코드 문자열)
     *
     * - MimeMessageHelper 의 두 번째 파라미터 true → multipart 메일 허용
     * - setText(html, true) → text/html 로 본문 처리
     * - HTML 태그/스타일 포함 가능
     */
    public void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage mm = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mm, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true); // true = text/html
            mailSender.send(mm);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("메일(HTML) 발송 실패: " + e.getMessage(), e);
        }
    }
}
