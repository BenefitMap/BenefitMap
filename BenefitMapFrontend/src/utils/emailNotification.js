/**
 * 이메일 알림 관련 유틸리티 함수들
 */

/**
 * 구글 이메일 알림 전송 함수
 * @param {string} userEmail - 사용자 이메일
 * @param {string} subject - 이메일 제목
 * @param {string} content - 이메일 내용
 * @param {Object} serviceInfo - 복지 서비스 정보
 */
export const sendGoogleEmailNotification = async (userEmail, subject, content, serviceInfo) => {
  try {
    // 실제 구현에서는 백엔드 API를 통해 이메일을 전송
    // 현재는 시뮬레이션을 위한 로그만 출력

    console.log('📧 구글 이메일 알림 전송 시뮬레이션:');
    console.log('받는 사람:', userEmail);
    console.log('제목:', subject);
    console.log('내용:', content);
    console.log('서비스 정보:', serviceInfo);

    // 백엔드 API 호출 (실제 구현)
    const response = await fetch('/api/mail/deadline-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        subject,
        body: content,
        html: true
      })
    });

    if (response.ok) {
      console.log('✅ 이메일 알림이 성공적으로 전송되었습니다.');
      return { success: true, message: '이메일 알림이 전송되었습니다.' };
    } else {
      console.error('❌ 이메일 알림 전송 실패:', response.statusText);
      return { success: false, message: '이메일 알림 전송에 실패했습니다.' };
    }

  } catch (error) {
    console.error('이메일 알림 전송 중 오류:', error);
    return { success: false, message: '이메일 알림 전송 중 오류가 발생했습니다.' };
  }
};

/**
 * 복지 서비스 마감일 알림 이메일 생성
 * @param {Object} notification - 알림 데이터
 * @returns {Promise<Object>} 이메일 전송 결과
 */
export const createDeadlineNotificationEmail = async (notification) => {
  const { service, daysLeft } = notification;
  const userEmail = getUserEmail();

  if (!userEmail) {
    console.warn('사용자 이메일이 없어 이메일 알림을 전송할 수 없습니다.');
    return { success: false, message: '사용자 이메일이 없습니다.' };
  }

  const subject = `[BenefitMap] ${service.title} 신청 마감 임박 알림 (D-${daysLeft})`;

  const content = `
안녕하세요, BenefitMap입니다.

선택하신 복지 서비스의 신청 마감일이 임박했습니다.

📋 서비스명: ${service.title}
📅 마감일: ${service.applicationPeriod?.endDate || service.deadlineDate}
⏰ 남은 기간: ${daysLeft}일
${service.department ? `🏢 담당부서: ${service.department}` : ''}
${service.contact ? `📞 문의처: ${service.contact}` : ''}

${service.description ? `📝 서비스 설명:\n${service.description}` : ''}

서둘러 신청하시기 바랍니다.
더 자세한 정보는 BenefitMap에서 확인하실 수 있습니다.

감사합니다.
BenefitMap 팀
  `.trim();

  return await sendGoogleEmailNotification(userEmail, subject, content, service);
};

/**
 * 새로운 복지 서비스 알림 이메일 생성
 * @param {Object} service - 새로운 복지 서비스 정보
 * @param {string} userEmail - 사용자 이메일
 */
export const createNewServiceNotificationEmail = async (service, userEmail) => {
  const subject = `[BenefitMap] 새로운 복지 서비스: ${service.title}`;

  const content = `
안녕하세요, BenefitMap입니다.

귀하의 관심사와 맞는 새로운 복지 서비스가 추가되었습니다.

🆕 새로운 서비스: ${service.title}
${service.applicationPeriod ? `📅 신청 기간: ${service.applicationPeriod.startDate} ~ ${service.applicationPeriod.endDate}` : ''}
${service.department ? `🏢 담당부서: ${service.department}` : ''}
${service.contact ? `📞 문의처: ${service.contact}` : ''}

${service.description ? `📝 서비스 설명:\n${service.description}` : ''}

BenefitMap에서 자세한 정보를 확인하고 신청해보세요!

감사합니다.
BenefitMap 팀
  `.trim();

  return await sendGoogleEmailNotification(userEmail, subject, content, service);
};

/**
 * 사용자 이메일 주소 가져오기 (구글 로그인 정보에서)
 */
export const getUserEmail = () => {
  // 실제로는 사용자 인증 정보에서 이메일을 가져옴
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  return userInfo.email || userInfo.picture || 'user@example.com';
};

/**
 * 이메일 알림 설정 확인
 */
export const isEmailNotificationEnabled = () => {
  const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
  return settings.emailNotifications === true;
};
