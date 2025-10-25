import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserEmail } from '../utils/emailNotification';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background-color: #4a9d5f;
  color: white;
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ServiceInfo = styled.div`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ServiceTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const ServicePeriod = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ServiceDepartment = styled.div`
  font-size: 14px;
  color: #666;
`;

const SettingGroup = styled.div`
  margin-bottom: 24px;
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin-bottom: 16px;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background-color: ${props => (props.active ? '#4a9d5f' : '#ccc')};
  border-radius: 12px;
  transition: background-color 0.3s ease;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => (props.active ? '26px' : '2px')};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s ease;
  }
`;

const Checkbox = styled.input`
  display: none;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #4a9d5f;
`;

const ModalFooter = styled.div`
  padding: 0 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  &.save {
    background-color: #4a9d5f;
    color: white;

    &:hover {
      background-color: #3d8450;
      transform: translateY(-1px);
    }
  }

  &.cancel {
    background-color: #6c757d;
    color: white;

    &:hover {
      background-color: #5a6268;
      transform: translateY(-1px);
    }
  }
`;

const ServiceNotificationModal = ({ isOpen, onClose, service, onSave }) => {
  const [settings, setSettings] = useState({
    headerNotifications: true, // 브라우저 알림 (UI는 숨김)
    emailNotifications: false,
    reminderDays: [3], // 기본값: 3일 전
  });

  const availableDays = [1, 3, 5, 7]; // 선택 가능한 일수
  const [userEmail, setUserEmail] = useState('');

  // 사용자 이메일 주소 가져오기
  useEffect(() => {
    const email = getUserEmail();
    setUserEmail(email);
  }, []);

  // 서비스별 설정 불러오기
  useEffect(() => {
    if (service) {
      const serviceSettings = JSON.parse(
          localStorage.getItem(`serviceNotification_${service.id}`) || '{}'
      );
      setSettings({
        headerNotifications: true,
        emailNotifications: false,
        reminderDays: [3],
        ...serviceSettings,
      });
    }
  }, [service]);

  // 설정 변경 핸들러
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 알림 일수 토글
  const toggleReminderDay = day => {
    const newReminderDays = settings.reminderDays.includes(day)
        ? settings.reminderDays.filter(d => d !== day)
        : [...settings.reminderDays, day].sort();

    handleSettingChange('reminderDays', newReminderDays);
  };

  // 저장 핸들러
  const handleSave = () => {
    if (service) {
      // 서비스별 설정 저장
      localStorage.setItem(
          `serviceNotification_${service.id}`,
          JSON.stringify(settings)
      );

      onSave?.(service.id, settings);
      onClose();
    }
  };

  if (!isOpen || !service) return null;

  return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>🔔 알림 설정</ModalHeader>

          <ModalBody>
            <ServiceInfo>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServicePeriod>
                신청기간:{' '}
                {service.applicationPeriod?.startDate} ~{' '}
                {service.applicationPeriod?.endDate}
              </ServicePeriod>
              <ServiceDepartment>
                담당부서: {service.department}
              </ServiceDepartment>
            </ServiceInfo>

            {/* 🔕 브라우저 알림 받기 섹션 숨김
          <SettingGroup>
            <SettingLabel>
              <Checkbox
                type="checkbox"
                checked={settings.headerNotifications}
                onChange={(e) =>
                  handleSettingChange('headerNotifications', e.target.checked)
                }
              />
              <ToggleSwitch active={settings.headerNotifications} />
              브라우저 알림 받기
            </SettingLabel>
          </SettingGroup>
          */}

            <SettingGroup>
              <SettingLabel>
                <Checkbox
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={e =>
                        handleSettingChange(
                            'emailNotifications',
                            e.target.checked
                        )
                    }
                />
                <ToggleSwitch active={settings.emailNotifications} />
                이메일로 알림 받기 ({userEmail || '이메일 없음'})
              </SettingLabel>
            </SettingGroup>

            <SettingGroup>
              <div
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '12px',
                  }}
              >
                언제 알림을 받을까요?
              </div>
              <CheckboxGroup>
                {availableDays.map(day => (
                    <CheckboxItem key={day}>
                      <CheckboxInput
                          type="checkbox"
                          checked={settings.reminderDays.includes(day)}
                          onChange={() => toggleReminderDay(day)}
                      />
                      {day}일 전에 알려주세요
                    </CheckboxItem>
                ))}
              </CheckboxGroup>
            </SettingGroup>
          </ModalBody>

          <ModalFooter>
            <ModalButton className="cancel" onClick={onClose}>
              취소
            </ModalButton>
            <ModalButton className="save" onClick={handleSave}>
              저장
            </ModalButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
  );
};

export default ServiceNotificationModal;
