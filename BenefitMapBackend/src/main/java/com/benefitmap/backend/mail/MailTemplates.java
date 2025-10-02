package com.benefitmap.backend.mail;

public class MailTemplates {

    /** D-3 알림 템플릿 */
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
