import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BenefitMapLogo from '../assets/BenefitMapLogo.png';
import mypageIcon from '../assets/mypage.png';
import { logout } from '../utils/auth';
import {
    colors,
    fonts,
    spacing,
    breakpoints,
    Dropdown,
    DropdownItem,
} from '../styles/CommonStyles';
import { useAuth } from '../hooks/useAuth';
import { useClickOutside } from '../hooks/useClickOutside';
// import { useNotifications } from '../hooks/useNotifications'; // 🔕 알림 훅 비활성화

/* =========================
   아이콘 SVG 컴포넌트
   ========================= */
/* 🔕 알림 벨 아이콘 등 알림 관련 아이콘 전부 주석 처리
const BellIconComponent = ({ hasNotification }) => (
  ...
);
const DeleteNotificationIcon = () => (...);
const HideNotificationIcon = () => (...);
const RestoreIcon = () => (...);
const CuteXIcon = () => (...);
*/

// ❗ RestoreIcon / CuteXIcon 등은 알림 드롭다운 내부에서만 쓰이므로 전부 주석해도 영향 없음
// 만약 나중에 다른 데서 쓸 거면 꺼내서 다시 쓰면 돼요.

/* =========================
   스타일 컴포넌트
   ========================= */
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
  right: 0;
  min-width: 160px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  padding: 8px 0;
`;

const StyledDropdownItem = styled(DropdownItem)`
  padding: 12px 16px;
  font-size: 14px;
  color: ${colors.text};
  font-weight: 500;
  border-radius: 0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    color: ${colors.primary};
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

/* 🔕 알림용 스타일 전부 주석 처리
const NotificationIcon = styled.div` ... `;
const NotificationDropdown = styled(Dropdown)` ... `;
const NotificationHeader = styled.div` ... `;
const NotificationHeaderTitle = styled.h3` ... `;
const HeaderActions = styled.div` ... `;
const TrashToggleButton = styled.button` ... `;
const NotificationList = styled.div` ... `;
const NotificationItemContainer = styled.div` ... `;
const ItemContent = styled.div` ... `;
const ItemTitle = styled.div` ... `;
const ItemText = styled.div` ... `;
const ItemTime = styled.div` ... `;
const MenuContainer = styled.div` ... `;
const MenuButton = styled.button` ... `;
const ContextMenu = styled.div` ... `;
const ContextMenuItem = styled.button` ... `;
const EmptyMessage = styled.div` ... `;
const TrashHeader = styled.div` ... `;
const TrashTitle = styled.div` ... `;
const BackToNotificationsButton = styled.button` ... `;
const ClearAllButton = styled.button` ... `;
const NotificationActions = styled.div` ... `;
const ActionButton = styled.button` ... `;
const RestoreButton = styled(ActionButton)` ... `;
const PermanentlyDeleteButton = styled(ActionButton)` ... `;
const ViewAllNotificationsButton = styled.button` ... `;
*/

/* =========================
   컴포넌트 본체
   ========================= */
const Header = () => {
    const navigate = useNavigate();

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // 🔕 알림 관련 state 전부 주석
    // const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    // const [visibleMenu, setVisibleMenu] = useState(null);
    // const [showDeletedNotifications, setShowDeletedNotifications] = useState(false);

    // 로그인 상태 / 유저 정보 (이름, 이메일 등)
    const { isAuthenticated } = useAuth() || {
        isAuthenticated: false,
    };

    // ✅ 프로필 이미지 전용 state
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    // 마운트 시 백엔드에서 최신 이미지URL 들고오기
    useEffect(() => {
        if (!isAuthenticated) return;

        (async () => {
            try {
                const res = await fetch('/user/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                const json = await res.json();
                if (json?.success && json?.data?.basic?.imageUrl) {
                    setProfileImageUrl(json.data.basic.imageUrl);
                } else {
                    setProfileImageUrl(null);
                }
            } catch (err) {
                console.error('헤더에서 /user/me 호출 실패:', err);
                setProfileImageUrl(null);
            }
        })();
    }, [isAuthenticated]);

    // 🔕 알림 훅 전부 주석
    /*
    const {
      notifications,
      deletedNotifications,
      unreadCount,
      markAsRead,
      deleteNotification,
      restoreNotification,
      permanentlyDeleteNotification,
      clearDeletedNotifications,
      checkDeadlineNotifications,
    } = useNotifications();
    */

    // 드롭다운 밖 클릭 시 닫기
    const profileRef = useClickOutside(() => setIsProfileDropdownOpen(false));

    // 🔕 알림 드롭다운 ref, 외부클릭 처리 주석
    /*
    const notificationRef = useClickOutside(() => {
      setIsNotificationDropdownOpen(false);
      setVisibleMenu(null);
    });
    */

    // 🔕 알림 데드라인 체크 인터벌 주석
    /*
    useEffect(() => {
      if (isAuthenticated) {
        checkDeadlineNotifications();
        const interval = setInterval(checkDeadlineNotifications, 5 * 60 * 1000); // 5분
        return () => clearInterval(interval);
      }
    }, [isAuthenticated, checkDeadlineNotifications]);
    */

    // 🔕 알림 아이템 클릭 핸들러 주석
    /*
    const handleNotificationClick = useCallback(
      (notification) => {
        markAsRead(notification.id);

        if (notification.type === 'deadline') {
          navigate('/calendar');
        } else {
          navigate('/mypage');
        }

        setIsNotificationDropdownOpen(false);
      },
      [markAsRead, navigate]
    );
    */

    // 프로필 드롭다운 토글
    const toggleProfileDropdown = useCallback(() => {
        setIsProfileDropdownOpen((prev) => !prev);
        // setIsNotificationDropdownOpen(false); // 🔕 알림 드롭다운 없으므로 필요 X
    }, []);

    // 🔕 알림 드롭다운 토글 주석
    /*
    const toggleNotificationDropdown = useCallback(() => {
      setIsNotificationDropdownOpen((prev) => !prev);
      setIsProfileDropdownOpen(false);
    }, []);
    */

    // 마이페이지 이동
    const handleMyPageClick = useCallback(() => {
        navigate('/mypage');
        setIsProfileDropdownOpen(false);
    }, [navigate]);

    // 로그아웃
    const handleLogoutClick = useCallback(() => {
        logout(navigate); // 서버 로그아웃 + localStorage 정리 + 리다이렉트
        setIsProfileDropdownOpen(false);
    }, [navigate]);

    // 🔕 알림 삭제 / 숨기기 / 복구 등 이벤트 전부 주석
    /*
    const handleDeleteNotification = useCallback(
      (e, id) => {
        e.stopPropagation();
        deleteNotification(id);
        setVisibleMenu(null);
      },
      [deleteNotification]
    );

    const handleHideNotification = useCallback((e, id) => {
      e.stopPropagation();
      console.log(`알림 숨기기: ID ${id}`);
      setVisibleMenu(null);
    }, []);

    const handleRestoreNotification = useCallback(
      (e, id) => {
        e.stopPropagation();
        restoreNotification(id);
      },
      [restoreNotification]
    );

    const handlePermanentlyDelete = useCallback(
      (e, id) => {
        e.stopPropagation();
        permanentlyDeleteNotification(id);
      },
      [permanentlyDeleteNotification]
    );

    const handleViewAllClick = useCallback(() => {
      navigate('/calendar');
      setIsNotificationDropdownOpen(false);
    }, [navigate]);
    */

    return (
        <HeaderContainer>
            {/* 왼쪽: 로고 + GNB */}
            <LeftSection>
                <Logo
                    src={BenefitMapLogo}
                    alt="Benefit Map"
                    onClick={() => navigate('/')}
                />
                <Nav>
                    <NavItem onClick={() => navigate('/ServicePage')}>
                        복지 서비스
                    </NavItem>
                    <NavItem onClick={() => navigate('/calendar')}>
                        알림 캘린더
                    </NavItem>
                </Nav>
            </LeftSection>

            {/* 오른쪽: (알림은 제거) 프로필 or 로그인 */}
            <RightSection>
                {isAuthenticated ? (
                    <>
                        {/* 🔕 알림 아이콘/드롭다운 전체 블록 통째로 주석
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <NotificationIcon onClick={toggleNotificationDropdown}>
                <BellIconComponent hasNotification={unreadCount > 0} />
              </NotificationIcon>

              {isNotificationDropdownOpen && (
                <NotificationDropdown>
                  ...알림 전체 UI...
                </NotificationDropdown>
              )}
            </div>
            */}

                        {/* 프로필 아이콘 / 드롭다운 */}
                        <div ref={profileRef} style={{ position: 'relative' }}>
                            <ProfileImage
                                src={profileImageUrl || mypageIcon}
                                alt="Profile"
                                onClick={toggleProfileDropdown}
                                onError={(e) => {
                                    e.currentTarget.src = mypageIcon;
                                }}
                            />
                            {isProfileDropdownOpen && (
                                <ProfileDropdown>
                                    <StyledDropdownItem onClick={handleMyPageClick}>
                                        마이페이지
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={handleLogoutClick}>
                                        로그아웃
                                    </StyledDropdownItem>
                                </ProfileDropdown>
                            )}
                        </div>
                    </>
                ) : (
                    // 비로그인 상태 - LOGIN 버튼
                    <LoginText onClick={() => navigate('/LoginPage')}>LOGIN</LoginText>
                )}
            </RightSection>
        </HeaderContainer>
    );
};

export default Header;
