import React from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const NotificationItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const NotificationDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const EmptyNotification = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

const Notification = () => {
  // 더미 알림 데이터
  const notifications = [
    {
      id: 1,
      title: '청년 주택 지원 신청 마감 임박',
      description: '신청 마감일이 3일 남았습니다.',
      time: '2시간 전'
    },
    {
      id: 2,
      title: '새로운 복지 서비스 등록',
      description: '청년 취업 지원금 서비스가 새로 등록되었습니다.',
      time: '1일 전'
    },
    {
      id: 3,
      title: '신청 완료 알림',
      description: '생계급여 신청이 완료되었습니다.',
      time: '3일 전'
    }
  ];

  return (
    <NotificationContainer>
      <NotificationHeader>
        알림
      </NotificationHeader>
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <NotificationItem key={notification.id}>
            <NotificationTitle>{notification.title}</NotificationTitle>
            <NotificationDescription>{notification.description}</NotificationDescription>
            <NotificationTime>{notification.time}</NotificationTime>
          </NotificationItem>
        ))
      ) : (
        <EmptyNotification>
          새로운 알림이 없습니다.
        </EmptyNotification>
      )}
    </NotificationContainer>
  );
};

export default Notification;
