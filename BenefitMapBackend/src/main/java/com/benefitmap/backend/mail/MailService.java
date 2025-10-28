package com.benefitmap.backend.mail;

import com.benefitmap.backend.mail.dto.SendMailRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public void sendMail(SendMailRequest request) {
        log.info("✉️  sendMail: from={}, to={}, subject={}, html={}",
                fromAddress, request.to(), request.subject(), request.html());

        try {
            // 1) 메시지 생성
            MimeMessage mime = mailSender.createMimeMessage();

            // 2) helper 세팅 (true = multipart 허용)
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            // 3) 보내는 사람
            String displayFrom = String.format("BenefitMap 알림 <%s>", fromAddress);
            helper.setFrom(displayFrom);

            // 4) 받는 사람 / 제목 / 본문
            helper.setTo(request.to());
            helper.setSubject(request.subject());
            helper.setText(request.body(), request.html()); // html=true면 HTML 메일

            // 5) 실제 전송
            mailSender.send(mime);

            log.info("✅ 메일 전송 완료 → {}", request.to());

        } catch (MessagingException e) {
            // MessagingException은 checked 예외라 여기서 처리해줘야 함
            log.error("❌ MessagingException 발생: {}", e.getMessage(), e);
            throw new RuntimeException("메일 메시지 구성 중 오류", e);

        } catch (MailException e) {
            // MailException은 보통 전송 실패 (SMTP 문제 등)
            log.error("❌ MailException 발생(실제 전송 실패): {}", e.getMessage(), e);
            throw e; // 그대로 던져서 컨트롤러에서 500 처리하게 할 수 있음
        }
    }
}
