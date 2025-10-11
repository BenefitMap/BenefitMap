package com.benefitmap.backend.mail;

/**
 * 메일 본문 템플릿 모음
 *
 * - HTML 형식으로 자주 사용하는 메일 내용을 정적 메서드로 제공
 * - 문자열 템플릿을 활용하여 정책명, 마감일, 상세 URL 등을 동적으로 삽입
 */
public class MailTemplates {

    /**
     * 📌 복지 신청 마감 D-3 알림 메일 템플릿
     *
     * @param policyName  복지 정책명
     * @param dueDate     마감일 (yyyy-MM-dd 등 문자열)
     * @param detailUrl   상세보기 링크
     * @return HTML 문자열 (메일 본문)
     *
     * - `String.formatted(...)` 사용해 파라미터 삽입
     * - HTML 태그와 스타일 포함
     * - 인라인 스타일 적용(메일 클라이언트 호환성 고려)
     */
    public static String d3Reminder(String policyName, String dueDate, String detailUrl) {
        return """
            <div style="font-family:system-ui,Segoe UI,Roboto,Apple SD Gothic Neo;">
              <h2>📢 복지 신청 D-3 알림</h2>
              <p><b>%s</b>의 신청 마감이 <b>D-3</b> 남았습니다.</p>
              <p>마감일: %s</p>
              <a href="%s" style="display:inline-block;padding:10px 14px;border:1px solid #ddd;border-radius:8px;text-decoration:none">
                자세히 보기
              </a>
              <p style="color:#888;font-size:12px;margin-top:18px;">본 메일은 BenefitMap 알림 설정에 따라 발송되었습니다.</p>
            </div>
        """.formatted(policyName, dueDate, detailUrl);
    }
}
