package com.benefitmap.backend.mail;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 메일 본문 템플릿 유틸리티
 *
 * BenefitMap이 주기적으로 보내는 "마감 임박(D-day)" 안내 메일처럼,
 * 자주 쓰이는 문구/레이아웃을 중앙에서 생성해주는 곳이다.
 *
 * 사용 시나리오:
 * - 스케줄러가 "D-3 알림"을 돌릴 때 이 클래스로 HTML/텍스트 본문을 만들고,
 *   그 결과를 SendMailRequest.body()에 넣어서 MailService로 전달.
 *
 * 장점:
 * - 메일 디자인/카피를 한 곳에서 관리 가능
 * - 프론트엔드에서 직접 body를 만들어 넘겨도 되지만,
 *   서버에서도 공통 포맷을 강제하고 싶다면 여기서 만들어 쓴다.
 */
public class MailTemplates {

    /** 날짜 표기를 yyyy-MM-dd 형태로 맞춘다. */
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * D-day 알림용 HTML 템플릿
     *
     * @param serviceTitle  복지 서비스 이름 (예: "청년 주거 지원금")
     * @param daysLeft      마감까지 남은 일수 (예: 3 → D-3)
     * @param deadlineDate  마감일(LocalDate). null이면 "(마감일 정보 없음)"으로 표시
     *
     * 반환:
     * - HTML 문자열 (UTF-8 기준)
     * - 인라인 스타일만 간단히 넣은 기본형 템플릿
     *
     * 메일 예시 구조:
     *  [BenefitMap] {서비스명} 마감 임박 안내
     *   - "D-3 (마감일: 2025-10-31)" 이런 식으로 강조
     *   - 하단에 "이 알림은 BenefitMap 알림 설정에 따른 것입니다..." 고지
     */
    public static String deadlineReminderHtml(String serviceTitle,
                                              int daysLeft,
                                              LocalDate deadlineDate) {

        String deadlineStr = (deadlineDate != null)
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
     * D-day 알림용 TEXT(plain text) 템플릿
     *
     * HTML 메일을 지원하지 않는 클라이언트를 위해
     * 같은 의미를 일반 텍스트 버전으로 제공한다.
     *
     * @param serviceTitle 복지 서비스 이름
     * @param daysLeft     마감까지 남은 일수
     * @param deadlineDate 마감일
     *
     * 결과 예:
     *
     * [BenefitMap] 청년 주거 지원금 마감 임박 안내
     *
     * 선택하신 복지 혜택 '청년 주거 지원금' 신청/등록 마감이 이제 D-3 입니다.
     * 마감일: 2025-10-31
     *
     * 서류 준비와 신청을 놓치지 않도록 지금 바로 확인해 주세요.
     *
     * ---
     * 이 알림은 BenefitMap에서 설정하신 일정 알림에 따라 발송되었습니다.
     * 더 이상 이 알림을 받고 싶지 않다면 BenefitMap 내 알림 설정을 변경해 주세요.
     */
    public static String deadlineReminderText(String serviceTitle,
                                              int daysLeft,
                                              LocalDate deadlineDate) {

        String deadlineStr = (deadlineDate != null)
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
