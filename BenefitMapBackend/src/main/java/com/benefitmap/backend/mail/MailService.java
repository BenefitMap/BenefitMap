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

/**
 * 실제 메일 전송 로직(Service 계층)
 *
 * MailController → MailService.sendMail() → SMTP 전송
 *
 * 이 서비스는 Spring Boot의 JavaMailSender를 사용해
 * Gmail SMTP(spring.mail.* 설정) 등으로 메일을 발송한다.
 *
 * 주요 포인트
 * - fromAddress: application.properties/yaml 의 spring.mail.username 값을 주입받는다.
 *   즉, 실제 발신 Gmail 계정.
 * - sendMail():
 *    1) MimeMessage 생성
 *    2) 제목/본문/수신자 세팅
 *    3) mailSender.send() 호출
 *
 * 예외 처리
 * - MessagingException: 메일 메시지 구성(헤더, 인코딩 등) 단계에서 발생하는 checked 예외
 *   → RuntimeException으로 감싸 다시 던진다.
 * - MailException: 전송(SMTP) 단계에서 발생하는 런타임 예외
 *   → 그대로 던져서 컨트롤러에서 500 처리.
 *
 * 로깅
 * - 전송 시도 / 성공 / 실패 로그를 남겨서 운영 시 추적 가능하게 한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    /**
     * spring.mail.username
     *
     * 예: benefitmap.team@gmail.com
     * 실제 Gmail 계정 주소를 여기서 주입받는다.
     * 이 주소를 From 헤더에 "BenefitMap 알림 <주소>" 형태로 넣는다.
     */
    @Value("${spring.mail.username}")
    private String fromAddress;

    /**
     * 메일 전송 메서드 (HTML 또는 일반 텍스트 지원)
     *
     * 입력: SendMailRequest
     *   - to(): 수신자 이메일
     *   - subject(): 제목
     *   - body(): 본문 문자열
     *   - html(): true면 body를 HTML로 렌더링, false면 text/plain
     *
     * 처리 순서:
     *  1) MimeMessage 생성
     *  2) MimeMessageHelper로 인코딩/본문/제목 설정
     *     - helper.setText(body, htmlFlag)
     *  3) mailSender.send() 로 전송
     *
     * 예외:
     *  - MessagingException → RuntimeException으로 래핑해서 throw
     *  - MailException → 그대로 throw (컨트롤러에서 잡아서 500 응답)
     */
    public void sendMail(SendMailRequest request) {
        log.info("✉️  sendMail: from={}, to={}, subject={}, html={}",
                fromAddress, request.to(), request.subject(), request.html());

        try {
            // 1) 빈 MimeMessage 생성
            MimeMessage mime = mailSender.createMimeMessage();

            // 2) helper 세팅
            //    - multipart 허용(true)
            //    - UTF-8로 인코딩
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            // 3) 발신자 설정
            //    Gmail/SMTP에서 허용 가능한 형식: "표시이름 <이메일주소>"
            String displayFrom = String.format("BenefitMap 알림 <%s>", fromAddress);
            helper.setFrom(displayFrom);

            // 4) 수신자 / 제목 / 본문
            helper.setTo(request.to());
            helper.setSubject(request.subject());
            // html=true면 HTML 메일, false면 일반 텍스트 메일
            helper.setText(request.body(), request.html());

            // 5) 실제 전송
            mailSender.send(mime);

            log.info("✅ 메일 전송 완료 → {}", request.to());

        } catch (MessagingException e) {
            // 메시지(헤더/본문) 구성 중 발생하는 checked 예외
            log.error("❌ MessagingException 발생: {}", e.getMessage(), e);
            throw new RuntimeException("메일 메시지 구성 중 오류", e);

        } catch (MailException e) {
            // SMTP 서버와의 통신 오류 등으로 실제 전송 실패
            log.error("❌ MailException 발생(실제 전송 실패): {}", e.getMessage(), e);
            throw e; // 컨트롤러에서 잡아서 500으로 내려감
        }
    }
}
