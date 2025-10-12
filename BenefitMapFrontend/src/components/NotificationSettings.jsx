import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SettingsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
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
  background-color: ${props => props.active ? '#4a9d5f' : '#ccc'};
  border-radius: 12px;
  transition: background-color 0.3s ease;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
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

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SelectLabel = styled.label`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4a9d5f;
  }
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

const SaveButton = styled.button`
  background-color: #4a9d5f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3d8450;
  }
`;

const NotificationSettings = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    emailNotifications: false,
    headerNotifications: true,
    reminderDays: [3], // 기본값: 3일 전
    availableDays: [1, 3, 5, 7] // 선택 가능한 일수
  });

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    setSettings(prev => ({
      ...prev,
      ...savedSettings,
      availableDays: [1, 3, 5, 7] // 항상 동일하게 유지
    }));
  }, []);

  // 설정 변경 핸들러
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    onSettingsChange?.(newSettings);
  };

  // 알림 일수 토글
  const toggleReminderDay = (day) => {
    const newReminderDays = settings.reminderDays.includes(day)
      ? settings.reminderDays.filter(d => d !== day)
      : [...settings.reminderDays, day].sort();
    
    handleSettingChange('reminderDays', newReminderDays);
  };

  return (
    <SettingsContainer>
      <SettingsTitle>
        🔔 알림 설정
      </SettingsTitle>
      
      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type="checkbox"
            checked={settings.headerNotifications}
            onChange={(e) => handleSettingChange('headerNotifications', e.target.checked)}
          />
          <ToggleSwitch active={settings.headerNotifications} />
          헤더 알림 받기
        </SettingLabel>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
          />
          <ToggleSwitch active={settings.emailNotifications} />
          이메일 알림 받기
        </SettingLabel>
      </SettingGroup>

      <SettingGroup>
        <SelectLabel>알림 받을 시점 선택</SelectLabel>
        <CheckboxGroup>
          {settings.availableDays.map(day => (
            <CheckboxItem key={day}>
              <CheckboxInput
                type="checkbox"
                checked={settings.reminderDays.includes(day)}
                onChange={() => toggleReminderDay(day)}
              />
              {day}일 전 알림
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </SettingGroup>

      <SaveButton onClick={() => alert('설정이 저장되었습니다!')}>
        설정 저장
      </SaveButton>
    </SettingsContainer>
  );
};

export default NotificationSettings;
