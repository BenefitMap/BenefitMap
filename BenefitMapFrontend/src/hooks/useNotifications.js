import { useState, useEffect, useCallback } from 'react';
import { createDeadlineNotificationEmail, getUserEmail, isEmailNotificationEnabled } from '../utils/emailNotification';
import { startDeadlineChecker, isDuplicateNotification } from '../utils/deadlineChecker';

/**
 * 알림 상태를 관리하는 커스텀 훅
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [deletedNotifications, setDeletedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 샘플 알림 데이터 (실제로는 API에서 가져올 데이터)
  const sampleNotifications = [
    {
      id: 1,
      title: "청년도전계좌 신청 마감 임박",
      content: "청년도전계좌 신청이 3일 후 마감됩니다. 서둘러 신청해보세요!",
      time: "2시간 전",
      isRead: false,
      type: "deadline",
      benefitId: "youth-account",
      deadlineDate: "2024-10-14"
    },
    {
      id: 2,
      title: "월세 지원금 신청 마감 임박",
      content: "월세 지원금 신청이 5일 후 마감됩니다. 서둘러 신청해보세요!",
      time: "1일 전",
      isRead: false,
      type: "deadline",
      benefitId: "rent-support",
      deadlineDate: "2024-10-16"
    },
    {
      id: 3,
      title: "온라인 교육 지원금 신청 가능",
      content: "온라인 교육 지원금 신청이 시작되었습니다.",
      time: "3일 전",
      isRead: true,
      type: "application",
      benefitId: "education-support",
      deadlineDate: "2024-11-30"
    },
    {
      id: 4,
      title: "취업 성공 패키지 신청 마감 임박",
      content: "취업 성공 패키지 신청이 2일 후 마감됩니다.",
      time: "6시간 전",
      isRead: false,
      type: "deadline",
      benefitId: "job-success-package",
      deadlineDate: "2024-10-13"
    },
    {
      id: 5,
      title: "생활비 지원금 신청 마감 임박",
      content: "생활비 지원금 신청이 1일 후 마감됩니다.",
      time: "4시간 전",
      isRead: true,
      type: "deadline",
      benefitId: "living-expense-support",
      deadlineDate: "2024-10-12"
    }
  ];

  // 알림 목록 가져오기
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      // 실제로는 API 호출
      // const response = await fetch('/api/notifications');
      // const data = await response.json();

      // 샘플 데이터 사용
      setTimeout(() => {
        setNotifications(sampleNotifications);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('알림 목록 가져오기 실패:', error);
      setNotifications([]);
      setIsLoading(false);
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  // 알림 삭제 (휴지통으로 이동)
  const deleteNotification = useCallback((notificationId) => {
    const notificationToDelete = notifications.find(notif => notif.id === notificationId);
    if (notificationToDelete) {
      // 삭제된 시간 추가
      const deletedNotification = {
        ...notificationToDelete,
        deletedAt: new Date().toISOString()
      };

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
      setDeletedNotifications(prev =>
        [...prev, deletedNotification]
      );
    }
  }, [notifications]);

  // 삭제된 알림 복구
  const restoreNotification = useCallback((notificationId) => {
    const notificationToRestore = deletedNotifications.find(notif => notif.id === notificationId);
    if (notificationToRestore) {
      // deletedAt 제거하고 다시 활성 알림으로 이동
      const { deletedAt, ...restoredNotification } = notificationToRestore;

      setDeletedNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
      setNotifications(prev =>
        [...prev, restoredNotification]
      );
    }
  }, [deletedNotifications]);

  // 영구 삭제
  const permanentlyDeleteNotification = useCallback((notificationId) => {
    setDeletedNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  }, []);

  // 모든 삭제된 알림 영구 삭제
  const clearDeletedNotifications = useCallback(() => {
    setDeletedNotifications([]);
  }, []);

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // 새로운 알림 추가 함수 (이메일 알림과 연동)
  const addNotificationWithEmail = useCallback(async (notificationData) => {
    // 중복 알림 체크
    if (isDuplicateNotification(notificationData.id, notifications)) {
      console.log('이미 존재하는 알림입니다:', notificationData.id);
      return null;
    }

    const newNotification = {
      ...notificationData,
      id: notificationData.id || Date.now(),
      time: '방금 전',
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // 이메일 알림 발송
    if (isEmailNotificationEnabled() && notificationData.type === 'deadline') {
      try {
        const result = await createDeadlineNotificationEmail(notificationData);
        if (result.success) {
          console.log('✅ 헤더 알림과 이메일 알림이 모두 생성되었습니다.');
        }
      } catch (error) {
        console.error('❌ 이메일 알림 생성 중 오류:', error);
      }
    }

    return newNotification;
  }, [notifications]);

  // 마감일 체크 및 알림 생성 함수
  const checkDeadlineNotifications = useCallback(async () => {
    try {
      await startDeadlineChecker(addNotificationWithEmail, createDeadlineNotificationEmail);
    } catch (error) {
      console.error('❌ 마감일 알림 체크 중 오류:', error);
    }
  }, [addNotificationWithEmail]);

  // 초기 로드
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    deletedNotifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    restoreNotification,
    permanentlyDeleteNotification,
    clearDeletedNotifications,
    refreshNotifications: fetchNotifications,
    addNotificationWithEmail,
    checkDeadlineNotifications,
  };
};
