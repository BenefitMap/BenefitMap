package com.benefitmap.backend.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    /** 간단한 텍스트 메일 */
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

    /** HTML 메일 (템플릿 없이 바로 문자열 전달) */
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
