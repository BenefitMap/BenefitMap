import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BenefitMapLogo from '../assets/BenefitMapLogo.png';
import mypageIcon from '../assets/mypage.png';
import { handleLogout } from '../utils/auth';
import { colors, fonts, spacing, breakpoints, Dropdown, DropdownItem } from '../styles/CommonStyles';
import { useAuth } from '../hooks/useAuth';
import { useClickOutside } from '../hooks/useClickOutside';
import { useNotifications } from '../hooks/useNotifications';

// --- 스타일 컴포넌트 ---
const HeaderContainer = styled.header`
  width: 100%;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${spacing.xxl};
  background-color: ${colors.background};
  border-bottom: 1px solid ${colors.border};
  box-sizing: border-box;
  
  @media (max-width: ${breakpoints.desktop}) { 
    padding: 0 ${spacing.lg}; 
  }
  @media (max-width: ${breakpoints.mobile}) { 
    height: 80px; 
    padding: 0 ${spacing.md}; 
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xxl};
`;

const Logo = styled.img`
  height: 32px;
  cursor: pointer;
  display: block;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
`;

const NavItem = styled.a`
  font-size: ${fonts.sizes.large};
  color: ${colors.text};
  text-decoration: none;
  cursor: pointer;
  font-family: ${fonts.primary};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
`;

const LoginText = styled.span`
  font-size: ${fonts.sizes.large};
  color: ${colors.text};
  letter-spacing: 2px;
  cursor: pointer;
  font-family: ${fonts.primary};
  font-weight: ${fonts.weights.medium};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
  }
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${colors.primary};
  object-fit: cover;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${colors.primaryHover};
    box-shadow: 0 2px 8px ${colors.shadowHover};
  }
`;

const ProfileDropdown = styled(Dropdown)`
  top: 60px;
`;

const StyledDropdownItem = styled(DropdownItem)`
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  font-size: ${fonts.sizes.small};
  color: ${colors.text};
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  padding: ${spacing.sm};
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  width: 40px;
  height: 40px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #ff4444;
  border-radius: 50%;
  border: 2px solid ${colors.background};
`;

const NotificationDropdown = styled(Dropdown)`
  top: 50px;
  right: 0;
  min-width: 300px;
  max-width: 400px;
`;

const NotificationItem = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationTitle = styled.div`
  font-weight: ${fonts.weights.medium};
  font-size: ${fonts.sizes.small};
  color: ${colors.text};
  margin-bottom: ${spacing.xs};
`;

const NotificationContent = styled.div`
  font-size: ${fonts.sizes.small};
  color: ${colors.textSecondary};
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: ${fonts.sizes.small};
  color: ${colors.textSecondary};
  margin-top: ${spacing.xs};
`;

const NotificationHeader = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationHeaderTitle = styled.div`
  font-weight: ${fonts.weights.medium};
  font-size: ${fonts.sizes.medium};
  color: ${colors.text};
`;

const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: ${fonts.sizes.small};
  cursor: pointer;
  padding: ${spacing.xs};
  
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationItemTitle = styled.div`
  font-weight: ${fonts.weights.medium};
  font-size: ${fonts.sizes.small};
  color: ${colors.text};
  margin-bottom: ${spacing.xs};
`;

const NotificationItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.xs};
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${spacing.xs};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${spacing.xs};
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #ff4444;
  
  &:hover {
    background-color: #ffe6e6;
  }
`;

const RestoreButton = styled(ActionButton)`
  color: ${colors.primary};
  
  &:hover {
    background-color: #f0f8f0;
  }
`;

const TrashToggleButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: ${fonts.sizes.small};
  cursor: pointer;
  padding: ${spacing.xs};
  
  &:hover {
    text-decoration: underline;
  }
`;

const TrashHeader = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
`;

const TrashTitle = styled.div`
  font-weight: ${fonts.weights.medium};
  font-size: ${fonts.sizes.small};
  color: ${colors.text};
`;

const ClearAllButton = styled.button`
  background: none;
  border: none;
  color: #ff4444;
  font-size: ${fonts.sizes.small};
  cursor: pointer;
  padding: ${spacing.xs};
  
  &:hover {
    text-decoration: underline;
  }
`;

const BackToNotificationsButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: ${fonts.sizes.small};
  cursor: pointer;
  padding: ${spacing.xs};
  
  &:hover {
    text-decoration: underline;
  }
`;




// --- 메인 Header 컴포넌트 ---
const Header = () => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [showDeletedNotifications, setShowDeletedNotifications] = useState(false);
  
  // 커스텀 훅 사용
  const { isAuthenticated, user } = useAuth();
  const { 
    notifications, 
    deletedNotifications,
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    restoreNotification,
    permanentlyDeleteNotification,
    clearDeletedNotifications,
    checkDeadlineNotifications
  } = useNotifications();
  const profileRef = useClickOutside(() => setIsProfileDropdownOpen(false));
  const notificationRef = useClickOutside(() => setIsNotificationDropdownOpen(false));

  // 마감일 체크 (컴포넌트 마운트 시 및 주기적으로)
  useEffect(() => {
    if (isAuthenticated) {
      // 초기 마감일 체크
      checkDeadlineNotifications();
      
      // 5분마다 마감일 체크 (실제로는 더 긴 간격이 좋을 수 있음)
      const interval = setInterval(() => {
        checkDeadlineNotifications();
      }, 5 * 60 * 1000); // 5분

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkDeadlineNotifications]);

  // 프로필 드롭다운 토글 함수 최적화
  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev);
    setIsNotificationDropdownOpen(false); // 다른 드롭다운 닫기
  }, []);

  // 알림 드롭다운 토글 함수
  const toggleNotificationDropdown = useCallback(() => {
    setIsNotificationDropdownOpen(prev => !prev);
    setIsProfileDropdownOpen(false); // 다른 드롭다운 닫기
  }, []);

  // 알림 클릭 핸들러
  const handleNotificationClick = useCallback((notification) => {
    // 알림을 읽음 처리
    markAsRead(notification.id);
    
    // 알림 타입에 따라 다른 페이지로 이동
    switch (notification.type) {
      case 'deadline':
        navigate('/calendar');
        break;
      case 'new_benefit':
        navigate('/ServicePage');
        break;
      case 'application':
        navigate('/ServicePage');
        break;
      default:
        navigate('/mypage');
    }
    
    setIsNotificationDropdownOpen(false);
  }, [markAsRead, navigate]);

  // 알림 삭제 핸들러
  const handleDeleteNotification = useCallback((e, notificationId) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    deleteNotification(notificationId);
  }, [deleteNotification]);

  // 삭제된 알림 복구 핸들러
  const handleRestoreNotification = useCallback((e, notificationId) => {
    e.stopPropagation();
    restoreNotification(notificationId);
  }, [restoreNotification]);

  // 영구 삭제 핸들러
  const handlePermanentlyDeleteNotification = useCallback((e, notificationId) => {
    e.stopPropagation();
    permanentlyDeleteNotification(notificationId);
  }, [permanentlyDeleteNotification]);

  // 마이페이지 이동 함수 최적화
  const handleMyPageClick = useCallback(() => {
    navigate('/mypage');
    setIsProfileDropdownOpen(false);
  }, [navigate]);

  // 로그아웃 함수 최적화
  const handleLogoutClick = useCallback(() => {
    handleLogout(navigate);
    setIsProfileDropdownOpen(false);
  }, [navigate]);

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo src={BenefitMapLogo} alt="Benefit Map" onClick={() => navigate('/')} />
        <Nav>
          <NavItem onClick={() => navigate('/ServicePage')}>복지 서비스</NavItem>
          <NavItem onClick={() => navigate('/calendar')}>알림 캘린더</NavItem>
        </Nav>
      </LeftSection>
      <RightSection>
        {isAuthenticated ? (
          <>
            {/* 알림 아이콘 */}
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <NotificationIcon onClick={toggleNotificationDropdown}>
                🔔
              </NotificationIcon>
              {unreadCount > 0 && <NotificationBadge />}
              {isNotificationDropdownOpen && (
                <NotificationDropdown>
                  <NotificationHeader>
                    <NotificationHeaderTitle>알림</NotificationHeaderTitle>
                    <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
                      {unreadCount > 0 && (
                        <MarkAllReadButton onClick={markAllAsRead}>
                          모두 읽음
                        </MarkAllReadButton>
                      )}
                      <TrashToggleButton 
                        onClick={() => setShowDeletedNotifications(true)}
                      >
                        🗑️ {deletedNotifications.length > 0 ? `(${deletedNotifications.length})` : '휴지통'}
                      </TrashToggleButton>
                    </div>
                  </NotificationHeader>
                  
                  {showDeletedNotifications ? (
                    <>
                      <TrashHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <BackToNotificationsButton 
                            onClick={() => setShowDeletedNotifications(false)}
                          >
                            ← 알림으로
                          </BackToNotificationsButton>
                          <TrashTitle>휴지통</TrashTitle>
                        </div>
                        {deletedNotifications.length > 0 && (
                          <ClearAllButton onClick={clearDeletedNotifications}>
                            모두 삭제
                          </ClearAllButton>
                        )}
                      </TrashHeader>
                      {deletedNotifications.length > 0 ? (
                        deletedNotifications.map((notification) => (
                          <NotificationItem 
                            key={notification.id}
                            style={{ 
                              backgroundColor: '#f8f8f8',
                              opacity: 0.7
                            }}
                          >
                            <NotificationItemHeader>
                              <NotificationItemTitle>{notification.title}</NotificationItemTitle>
                              <NotificationActions>
                                <RestoreButton 
                                  onClick={(e) => handleRestoreNotification(e, notification.id)}
                                  title="복구"
                                >
                                  ↩️
                                </RestoreButton>
                                <DeleteButton 
                                  onClick={(e) => handlePermanentlyDeleteNotification(e, notification.id)}
                                  title="영구 삭제"
                                >
                                  🗑️
                                </DeleteButton>
                              </NotificationActions>
                            </NotificationItemHeader>
                            <NotificationContent>{notification.content}</NotificationContent>
                            <NotificationTime>
                              삭제됨: {new Date(notification.deletedAt).toLocaleString()}
                            </NotificationTime>
                          </NotificationItem>
                        ))
                      ) : (
                        <NotificationItem>
                          <NotificationContent>휴지통이 비어있습니다.</NotificationContent>
                        </NotificationItem>
                      )}
                    </>
                  ) : (
                    <>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <NotificationItem 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            style={{ 
                              backgroundColor: notification.isRead ? 'transparent' : '#f8f9fa' 
                            }}
                          >
                            <NotificationItemHeader>
                              <NotificationItemTitle>{notification.title}</NotificationItemTitle>
                              <NotificationActions>
                                <DeleteButton 
                                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                                  title="삭제"
                                >
                                  🗑️
                                </DeleteButton>
                              </NotificationActions>
                            </NotificationItemHeader>
                            <NotificationContent>{notification.content}</NotificationContent>
                            <NotificationTime>{notification.time}</NotificationTime>
                          </NotificationItem>
                        ))
                      ) : (
                        <NotificationItem>
                          <NotificationContent>새로운 알림이 없습니다.</NotificationContent>
                        </NotificationItem>
                      )}
                    </>
                  )}
                </NotificationDropdown>
              )}
            </div>

            {/* 프로필 이미지 */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <ProfileImage 
                src={user?.picture || mypageIcon} 
                alt="Profile" 
                onClick={toggleProfileDropdown}
              />
              {isProfileDropdownOpen && (
                <ProfileDropdown>
                  <StyledDropdownItem onClick={handleMyPageClick}>
                    👤 마이페이지
                  </StyledDropdownItem>
                  <StyledDropdownItem onClick={handleLogoutClick}>
                    🚪 로그아웃
                  </StyledDropdownItem>
                </ProfileDropdown>
              )}
            </div>
          </>
        ) : (
          <LoginText onClick={() => navigate('/LoginPage')}>LOGIN</LoginText>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;