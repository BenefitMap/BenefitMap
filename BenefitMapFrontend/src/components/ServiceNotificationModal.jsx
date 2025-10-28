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

const TestSendWrapper = styled.div`
  margin-bottom: 24px;
  text-align: center;
  background-color: #fffbea;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 16px;
`;

const TestSendTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const TestSendDesc = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const TestSendButton = styled.button`
  background-color: #4a9d5f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3d8450;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 157, 95, 0.3);
  }

  &:disabled {
    background-color: #bbb;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
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

  // 즉시발송 버튼 로딩 상태
  const [isSendingTest, setIsSendingTest] = useState(false);

  // 선택 가능한 안내일
  const availableDays = [1, 3, 5, 7];

  // 사용자 이메일 세팅
  useEffect(() => {
    // 1순위: localStorage 등에서 util로 가져온 이메일
    let emailFromLocal = getUserEmail?.() || '';

    const fetchEmailFromServer = async () => {
      try {
        const res = await fetch('/user/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
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

        // 서버 실패 or 없으면 로컬 fallback
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

    // 부모 콜백
    onSave?.(service.id, settings);

    onClose();
  };

  // ---- 테스트용 즉시 메일 전송 ----
  const handleSendTestMail = async () => {
    if (!service) {
      alert('서비스 정보가 없습니다.');
      return;
    }
    if (!userEmail) {
      alert('이메일을 찾을 수 없습니다. (로그인 필요?)');
      return;
    }

    // 단순 테스트용으로 daysLeft를 3일로 고정
    const daysLeft = 3;

    const subject = `[테스트] ${service.title} 신청 마감 임박 (D-${daysLeft})`;
    const content = `
테스트 메일입니다. 실제 마감 알림 메일은 설정된 날짜(D-1, D-3 등)에 자동으로 전송됩니다.

📋 서비스명: ${service.title}
📅 마감일: ${service.applicationPeriod?.endDate || 'N/A'}
⏰ 남은 기간: ${daysLeft}일
${service.department ? `🏢 담당부서: ${service.department}` : ''}
${service.contact ? `📞 문의처: ${service.contact}` : ''}

${service.description ? `📝 서비스 설명:\n${service.description}` : ''}

- BenefitMap 테스트 발송 -
`.trim();

    try {
      setIsSendingTest(true);

      const res = await fetch('/api/mail/deadline-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 백엔드 SendMailRequest DTO에 맞춘 필드들
        body: JSON.stringify({
          to: userEmail,
          subject: subject,
          body: content,
          html: false, // 텍스트 버전. 필요하면 true로 바꾸고 HTML 문자열로 구성해도 됨
        }),
      });

      if (res.ok) {
        alert('✅ 테스트 메일이 전송되었습니다!');
      } else {
        console.error('메일 전송 실패 status=', res.status);
        alert('❌ 전송 실패 (백엔드 로그 확인 필요)');
      }
    } catch (err) {
      console.error('메일 전송 중 오류:', err);
      alert('❌ 전송 중 오류 발생 (콘솔 확인)');
    } finally {
      setIsSendingTest(false);
    }
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

          {/* 테스트 메일 즉시 보내기 */}
          <TestSendWrapper>
            <TestSendTitle>📤 지금 바로 테스트 메일 보내보기</TestSendTitle>
            <TestSendDesc>
              현재 이메일 주소로 “마감 임박 알림” 테스트 메일을 즉시 발송합니다.
              (실제 D-Day랑 무관한 개발용 기능)
            </TestSendDesc>

            <TestSendButton
              onClick={handleSendTestMail}
              disabled={isSendingTest}
            >
              {isSendingTest ? '전송 중…' : '지금 보내기'}
            </TestSendButton>
          </TestSendWrapper>
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
