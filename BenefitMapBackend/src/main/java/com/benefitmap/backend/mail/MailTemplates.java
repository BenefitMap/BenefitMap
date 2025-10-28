package com.benefitmap.backend.mail;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 이메일 본문 HTML/Text 템플릿 유틸.
 * - D-day 알림 문구 등 공통 패턴 텍스트 생성
 * - 프론트에서 직접 body를 만들어 보내도 되지만,
 *   서버에서도 만들어주려면 여기서 조합하면 된다.
 */
public class MailTemplates {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 마감 임박 알림용 HTML 템플릿 예시
     *
     * @param serviceTitle  복지 서비스 이름
     * @param daysLeft      며칠 남았는지 (예: 3)
     * @param deadlineDate  마감일 (yyyy-MM-dd)
     */
    public static String deadlineReminderHtml(String serviceTitle,
                                              int daysLeft,
                                              LocalDate deadlineDate) {

        String deadlineStr = deadlineDate != null
                ? deadlineDate.format(DATE_FMT)
                : "(마감일 정보 없음)";

        return """
            <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height:1.5; font-size:14px; color:#222;">
              <h2 style="margin:0 0 12px 0; font-size:16px; font-weight:bold;">
                [BenefitMap] %s 마감 임박 안내
              </h2>

              <p style="margin:0 0 8px 0;">
                선택하신 복지 혜택 <strong>%s</strong> 신청/등록 마감이 이제
                <strong>D-%d</strong> (마감일: %s) 입니다.
              </p>

              <p style="margin:0 0 8px 0;">
                서류 준비와 신청을 놓치지 않도록 지금 바로 확인해 주세요.
              </p>

              <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />

              <p style="font-size:12px; color:#666;">
                이 알림은 BenefitMap에서 설정하신 일정 알림에 따라 발송되었습니다.<br/>
                더 이상 이 알림을 받고 싶지 않다면 BenefitMap 내 알림 설정을 변경해 주세요.
              </p>
            </div>
            """.formatted(serviceTitle, serviceTitle, daysLeft, deadlineStr);
    }

    /**
     * 동일 내용을 text/plain 버전으로 만들고 싶을 때.
     */
    public static String deadlineReminderText(String serviceTitle,
                                              int daysLeft,
                                              LocalDate deadlineDate) {

        String deadlineStr = deadlineDate != null
                ? deadlineDate.format(DATE_FMT)
                : "(마감일 정보 없음)";

        return """
            [BenefitMap] %s 마감 임박 안내

            선택하신 복지 혜택 '%s' 신청/등록 마감이 이제 D-%d 입니다.
            마감일: %s

            서류 준비와 신청을 놓치지 않도록 지금 바로 확인해 주세요.

            ---
            이 알림은 BenefitMap에서 설정하신 일정 알림에 따라 발송되었습니다.
            더 이상 이 알림을 받고 싶지 않다면 BenefitMap 내 알림 설정을 변경해 주세요.
            """.formatted(serviceTitle, serviceTitle, daysLeft, deadlineStr);
    }
}
