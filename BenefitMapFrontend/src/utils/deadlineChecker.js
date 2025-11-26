/**
 * 복지서비스 마감일 체크 및 알림 생성 유틸리티
 */

/**
 * 복지서비스 마감일까지 남은 일수 계산
 * @param {string} endDate - 마감일 (YYYY-MM-DD 형식)
 * @returns {number} 남은 일수
 */
export const getDaysUntilDeadline = (endDate) => {
  const today = new Date();
  const deadline = new Date(endDate);

  // 시간을 00:00:00으로 설정하여 정확한 일수 계산
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * 복지서비스 목록에서 마감일이 임박한 서비스들을 찾기
 * @param {Array} services - 복지서비스 목록
 * @param {Array} reminderDays - 알림을 받을 일수 배열 (예: [1, 3, 5])
 * @returns {Array} 알림이 필요한 서비스 목록
 */
export const findUpcomingDeadlines = (services, reminderDays = [3]) => {
  const upcomingServices = [];

  services.forEach(service => {
    if (service.applicationPeriod && service.applicationPeriod.endDate) {
      const daysLeft = getDaysUntilDeadline(service.applicationPeriod.endDate);

      // 서비스별 알림 설정 가져오기
      const serviceSettings = JSON.parse(
        localStorage.getItem(`serviceNotification_${service.id}`) || '{}'
      );

      // 서비스별 설정이 있으면 해당 설정 사용, 없으면 기본 설정 사용
      const serviceReminderDays = serviceSettings.reminderDays || reminderDays;
      const headerNotifications = serviceSettings.headerNotifications !== false; // 기본값 true

      // 마감일이 임박한 경우 (양수이고 설정된 알림 일수에 포함된 경우)
      if (daysLeft > 0 && serviceReminderDays.includes(daysLeft) && headerNotifications) {
        upcomingServices.push({
          ...service,
          daysUntilDeadline: daysLeft,
          notificationType: 'deadline',
          serviceSettings // 서비스별 설정도 함께 전달
        });
      }
    }
  });

  return upcomingServices;
};

/**
 * 알림 데이터 생성
 * @param {Object} service - 복지서비스 정보
 * @param {number} daysLeft - 남은 일수
 * @returns {Object} 알림 데이터
 */
export const createDeadlineNotification = (service, daysLeft) => {
  const title = `${service.title} 신청 마감 임박`;
  const content = `${service.title} 신청이 ${daysLeft}일 후 마감됩니다. 서둘러 신청해보세요!`;

  return {
    id: `deadline_${service.id}_${daysLeft}`,
    title,
    content,
    time: '방금 전',
    isRead: false,
    type: 'deadline',
    benefitId: service.id,
    deadlineDate: service.applicationPeriod.endDate,
    daysLeft,
    service: service
  };
};

/**
 * 로컬 스토리지에서 복지서비스 목록 가져오기
 * @returns {Array} 복지서비스 목록
 */
export const getCalendarServices = () => {
  try {
    const services = JSON.parse(localStorage.getItem('calendarServices') || '[]');
    return services;
  } catch (error) {
    console.error('복지서비스 목록을 불러오는 중 오류:', error);
    return [];
  }
};

/**
 * 알림 설정 가져오기
 * @returns {Object} 알림 설정
 */
export const getNotificationSettings = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    return {
      emailNotifications: false,
      headerNotifications: true,
      reminderDays: [3],
      ...settings
    };
  } catch (error) {
    console.error('알림 설정을 불러오는 중 오류:', error);
    return {
      emailNotifications: false,
      headerNotifications: true,
      reminderDays: [3]
    };
  };
};

/**
 * 중복 알림 체크
 * @param {string} notificationId - 알림 ID
 * @param {Array} existingNotifications - 기존 알림 목록
 * @returns {boolean} 중복 여부
 */
export const isDuplicateNotification = (notificationId, existingNotifications) => {
  return existingNotifications.some(notif => notif.id === notificationId);
};

/**
 * 복지서비스 마감일 알림 체크 및 생성
 * @param {Function} addNotification - 알림 추가 함수
 * @param {Function} sendEmailNotification - 이메일 알림 전송 함수
 * @returns {Promise<Array>} 생성된 알림 목록
 */
export const checkAndCreateDeadlineNotifications = async (addNotification, sendEmailNotification) => {
  const services = getCalendarServices();
  const settings = getNotificationSettings();

  if (!settings.headerNotifications) {
    return [];
  }

  const upcomingServices = findUpcomingDeadlines(services, settings.reminderDays);
  const createdNotifications = [];

  for (const service of upcomingServices) {
    const notification = createDeadlineNotification(service, service.daysUntilDeadline);

    try {
      // 헤더 알림 추가
      await addNotification(notification);
      createdNotifications.push(notification);

      // 이메일 알림 전송 (서비스별 설정이 활성화된 경우)
      const serviceSettings = service.serviceSettings || {};
      const emailEnabled = serviceSettings.emailNotifications || false;

      if (emailEnabled && sendEmailNotification) {
        await sendEmailNotification(notification);
        console.log(`📧 이메일 알림 전송됨: ${service.title}`);
      }

      console.log(`✅ 알림 생성됨: ${service.title} (${service.daysUntilDeadline}일 전)`);
    } catch (error) {
      console.error(`❌ 알림 생성 실패: ${service.title}`, error);
    }
  }

  return createdNotifications;
};

/**
 * 정기적으로 마감일을 체크하는 함수 (페이지 로드 시 호출)
 * @param {Function} addNotification - 알림 추가 함수
 * @param {Function} sendEmailNotification - 이메일 알림 전송 함수
 */
export const startDeadlineChecker = async (addNotification, sendEmailNotification) => {
  try {
    const notifications = await checkAndCreateDeadlineNotifications(addNotification, sendEmailNotification);

    if (notifications.length > 0) {
      console.log(`📢 ${notifications.length}개의 마감일 알림이 생성되었습니다.`);
    } else {
      console.log('📅 마감일이 임박한 서비스가 없습니다.');
    }
  } catch (error) {
    console.error('❌ 마감일 체크 중 오류:', error);
  }
};
