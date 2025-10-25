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
  // 알림 설정 값
  const [settings, setSettings] = useState({
    headerNotifications: true, // (브라우저 알림은 UI에서 숨김 유지)
    emailNotifications: false,
    reminderDays: [3], // 기본값: 마감 3일 전
  });

  // 유저 이메일 표시용
  const [userEmail, setUserEmail] = useState('');

  // 선택 가능한 안내일
  const availableDays = [1, 3, 5, 7];

  // 사용자 이메일 세팅
  useEffect(() => {
    // 1순위: util에서 가져온 이메일
    let emailFromLocal = getUserEmail?.() || '';

    // 만약 util에서 못 가져오면 서버에서 받아와본다 (/user/me 같은 엔드포인트 가정)
    const fetchEmailFromServer = async () => {
      try {
        const res = await fetch('/user/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          // 백엔드 응답 구조에 맞게 email 경로 수정
          // 예시: json.data.basic.email
          const apiEmail =
              json?.data?.basic?.email ||
              json?.data?.email ||
              json?.email ||
              '';

          if (apiEmail) {
            setUserEmail(apiEmail);
            return;
          }
        }

        // 서버에서도 못 받았으면 local fallback
        setUserEmail(emailFromLocal || '');
      } catch (err) {
        console.error('이메일 정보 가져오기 실패:', err);
        setUserEmail(emailFromLocal || '');
      }
    };

    fetchEmailFromServer();
  }, []);

  // 특정 서비스의 기존 설정 불러오기 (로컬 저장된 거)
  useEffect(() => {
    if (!service) return;

    const serviceSettings = JSON.parse(
        localStorage.getItem(`serviceNotification_${service.id}`) || '{}'
    );

    setSettings({
      headerNotifications: true,
      emailNotifications: false,
      reminderDays: [3],
      ...serviceSettings,
    });
  }, [service]);

  // 설정 일부 변경
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // "X일 전에 알려주세요" 체크 토글
  const toggleReminderDay = day => {
    const newReminderDays = settings.reminderDays.includes(day)
        ? settings.reminderDays.filter(d => d !== day)
        : [...settings.reminderDays, day].sort();

    handleSettingChange('reminderDays', newReminderDays);
  };

  // 저장 버튼 클릭
  const handleSave = () => {
    if (!service) return;

    // 서비스별 개별 설정 로컬스토리지에 저장
    localStorage.setItem(
        `serviceNotification_${service.id}`,
        JSON.stringify(settings)
    );

    // 부모에게도 알려주기 (ex. 캘린더에서 console.log 하던 거)
    onSave?.(service.id, settings);

    onClose();
  };

  if (!isOpen || !service) return null;

  return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>🔔 알림 설정</ModalHeader>

          <ModalBody>
            {/* 서비스 기본 정보 */}
            <ServiceInfo>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServicePeriod>
                신청기간:{' '}
                {service.applicationPeriod?.startDate} ~{' '}
                {service.applicationPeriod?.endDate}
              </ServicePeriod>
              <ServiceDepartment>
                담당부서:{' '}
                {service.department || '담당부서 정보 없음'}
              </ServiceDepartment>
            </ServiceInfo>

            {/* 🔕 브라우저 알림(헤더 알림)은 임시 비표시 상태라 주석 유지 중
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

            {/* 이메일 알림 설정 */}
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
                이메일로 알림 받기 (
                {userEmail || '이메일 없음'}
                )
              </SettingLabel>
            </SettingGroup>

            {/* 며칠 전에 알려줄지 */}
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
