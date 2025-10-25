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
import { useNotifications } from '../hooks/useNotifications';

/* =========================
   아이콘 SVG 컴포넌트
   ========================= */
const BellIconComponent = ({ hasNotification }) => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
            stroke="#444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22.0001C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
            stroke="#444"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {hasNotification && (
            <g>
                <circle
                    cx="18.5"
                    cy="5.5"
                    r="4"
                    fill="#E53E3E"
                    stroke={colors.background}
                    strokeWidth="1.5"
                />
                <text
                    x="18.5"
                    y="7"
                    textAnchor="middle"
                    fill="white"
                    fontSize="5px"
                    fontWeight="bold"
                >
                    !
                </text>
            </g>
        )}
    </svg>
);

const DeleteNotificationIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22.0001C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
            <path d="M1 1L23 23" />
        </g>
    </svg>
);

const HideNotificationIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.003 10.003 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.998 9.998 0 0 1 12 4c7 0 11 8 11 8a18.51 18.51 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <path d="M1 1l22 22" />
        </g>
    </svg>
);

const RestoreIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M9 14L4 9L9 5"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M20 19.5V13.5C20 11.2909 18.2091 9.5 16 9.5H4"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CuteXIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M18 6L6 18"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6 6L18 18"
            stroke="#333"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

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

const NotificationIcon = styled.div`
    position: relative;
    cursor: pointer;
    padding: ${spacing.sm};
    border-radius: 50%;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const NotificationDropdown = styled(Dropdown)`
    top: 60px;
    right: 0;
    width: 380px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1000;
    border: 1px solid #ddd;
    padding: 0;
`;

const NotificationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e9e9e9;
`;

const NotificationHeaderTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
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

const NotificationList = styled.div`
    max-height: 450px;
    overflow-y: auto;
`;

const NotificationItemContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    position: relative;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
`;

const ItemContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ItemTitle = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${colors.text};
`;

const ItemText = styled.div`
    font-size: 14px;
    color: ${colors.textSecondary};
`;

const ItemTime = styled.div`
    font-size: 12px;
    color: ${colors.textSecondary};
    margin-top: 4px;
`;

const MenuContainer = styled.div`
    position: relative;
    align-self: flex-start;
`;

const MenuButton = styled.button`
    background: transparent;
    border: none;
    font-size: 22px;
    color: #aaa;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    line-height: 1;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const ContextMenu = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 8px;
    z-index: 10;
    border: 1px solid #eee;
    width: 170px;
`;

const ContextMenuItem = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #444;
    text-align: left;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const EmptyMessage = styled.div`
    padding: 40px;
    text-align: center;
    color: #888;
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

const NotificationActions = styled.div`
    display: flex;
    gap: ${spacing.xs};
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: ${spacing.xs};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
`;

const RestoreButton = styled(ActionButton)`
    &:hover {
        background-color: #f0f0f0;
    }
`;

const PermanentlyDeleteButton = styled(ActionButton)`
    &:hover {
        background-color: #f0f0f0;
    }
`;

const ViewAllNotificationsButton = styled.button`
    width: 100%;
    padding: 14px 0;
    border: none;
    border-top: 1px solid #e9e9e9;
    background-color: #ffffff;
    color: ${colors.text};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
        background-color: #f8f9fa;
        color: ${colors.primary};
    }
`;

/* =========================
   컴포넌트 본체
   ========================= */
const Header = () => {
    const navigate = useNavigate();

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [visibleMenu, setVisibleMenu] = useState(null);
    const [showDeletedNotifications, setShowDeletedNotifications] = useState(false);

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
                    // 응답이 왔는데 imageUrl이 없으면 기본 아이콘 쓰게 둠
                    setProfileImageUrl(null);
                }
            } catch (err) {
                console.error('헤더에서 /user/me 호출 실패:', err);
                setProfileImageUrl(null);
            }
        })();
    }, [isAuthenticated]);

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

    // 드롭다운 밖 클릭 시 닫기
    const profileRef = useClickOutside(() => setIsProfileDropdownOpen(false));
    const notificationRef = useClickOutside(() => {
        setIsNotificationDropdownOpen(false);
        setVisibleMenu(null);
    });

    // 알림 데드라인 체크 인터벌
    useEffect(() => {
        if (isAuthenticated) {
            checkDeadlineNotifications();
            const interval = setInterval(checkDeadlineNotifications, 5 * 60 * 1000); // 5분
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, checkDeadlineNotifications]);

    // 알림 아이템 클릭
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

    // 프로필 드롭다운 토글
    const toggleProfileDropdown = useCallback(() => {
        setIsProfileDropdownOpen((prev) => !prev);
        setIsNotificationDropdownOpen(false);
    }, []);

    // 알림 드롭다운 토글
    const toggleNotificationDropdown = useCallback(() => {
        setIsNotificationDropdownOpen((prev) => !prev);
        setIsProfileDropdownOpen(false);
    }, []);

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

    // 알림 삭제
    const handleDeleteNotification = useCallback(
        (e, id) => {
            e.stopPropagation();
            deleteNotification(id);
            setVisibleMenu(null);
        },
        [deleteNotification]
    );

    // 알림 숨기기
    const handleHideNotification = useCallback((e, id) => {
        e.stopPropagation();
        console.log(`알림 숨기기: ID ${id}`);
        setVisibleMenu(null);
    }, []);

    // 휴지통 -> 복구
    const handleRestoreNotification = useCallback(
        (e, id) => {
            e.stopPropagation();
            restoreNotification(id);
        },
        [restoreNotification]
    );

    // 휴지통 -> 영구 삭제
    const handlePermanentlyDelete = useCallback(
        (e, id) => {
            e.stopPropagation();
            permanentlyDeleteNotification(id);
        },
        [permanentlyDeleteNotification]
    );

    // "알림 전체보기 >" 버튼
    const handleViewAllClick = useCallback(() => {
        navigate('/calendar');
        setIsNotificationDropdownOpen(false);
    }, [navigate]);

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

            {/* 오른쪽: 알림 + 프로필 or 로그인 */}
            <RightSection>
                {isAuthenticated ? (
                    <>
                        {/* 알림 아이콘/드롭다운 */}
                        <div ref={notificationRef} style={{ position: 'relative' }}>
                            <NotificationIcon onClick={toggleNotificationDropdown}>
                                <BellIconComponent hasNotification={unreadCount > 0} />
                            </NotificationIcon>

                            {isNotificationDropdownOpen && (
                                <NotificationDropdown>
                                    {showDeletedNotifications ? (
                                        <>
                                            {/* 휴지통 화면 */}
                                            <TrashHeader>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: spacing.sm,
                                                    }}
                                                >
                                                    <BackToNotificationsButton
                                                        onClick={() => setShowDeletedNotifications(false)}
                                                    >
                                                        ← 알림으로
                                                    </BackToNotificationsButton>
                                                    <TrashTitle>휴지통</TrashTitle>
                                                </div>

                                                {deletedNotifications.length > 0 && (
                                                    <ClearAllButton onClick={clearDeletedNotifications}>
                                                        모두 비우기
                                                    </ClearAllButton>
                                                )}
                                            </TrashHeader>

                                            <NotificationList>
                                                {deletedNotifications.length > 0 ? (
                                                    deletedNotifications.map((notification) => (
                                                        <NotificationItemContainer key={notification.id}>
                                                            <ItemContent>
                                                                <ItemTitle
                                                                    style={{
                                                                        textDecoration: 'line-through',
                                                                        color: '#999',
                                                                    }}
                                                                >
                                                                    {notification.title}
                                                                </ItemTitle>
                                                                <ItemText
                                                                    style={{
                                                                        textDecoration: 'line-through',
                                                                        color: '#aaa',
                                                                    }}
                                                                >
                                                                    {notification.content}
                                                                </ItemText>
                                                                <ItemTime>
                                                                    삭제됨:{' '}
                                                                    {new Date(
                                                                        notification.deletedAt
                                                                    ).toLocaleString()}
                                                                </ItemTime>
                                                            </ItemContent>

                                                            <NotificationActions>
                                                                <RestoreButton
                                                                    onClick={(e) =>
                                                                        handleRestoreNotification(
                                                                            e,
                                                                            notification.id
                                                                        )
                                                                    }
                                                                    title="복구"
                                                                >
                                                                    <RestoreIcon />
                                                                </RestoreButton>
                                                                <PermanentlyDeleteButton
                                                                    onClick={(e) =>
                                                                        handlePermanentlyDelete(
                                                                            e,
                                                                            notification.id
                                                                        )
                                                                    }
                                                                    title="영구 삭제"
                                                                >
                                                                    <CuteXIcon />
                                                                </PermanentlyDeleteButton>
                                                            </NotificationActions>
                                                        </NotificationItemContainer>
                                                    ))
                                                ) : (
                                                    <EmptyMessage>휴지통이 비어있습니다.</EmptyMessage>
                                                )}
                                            </NotificationList>
                                        </>
                                    ) : (
                                        <>
                                            {/* 일반 알림 화면 */}
                                            <NotificationHeader>
                                                <NotificationHeaderTitle>알림</NotificationHeaderTitle>
                                                <HeaderActions>
                                                    <TrashToggleButton
                                                        onClick={() => setShowDeletedNotifications(true)}
                                                    >
                                                        휴지통{' '}
                                                        {deletedNotifications.length > 0 &&
                                                            `(${deletedNotifications.length})`}
                                                    </TrashToggleButton>
                                                </HeaderActions>
                                            </NotificationHeader>

                                            <NotificationList>
                                                {notifications.length > 0 ? (
                                                    notifications.map((notification) => (
                                                        <NotificationItemContainer
                                                            key={notification.id}
                                                            style={{
                                                                backgroundColor: notification.isRead
                                                                    ? 'transparent'
                                                                    : '#f8f9fa',
                                                            }}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <ItemContent>
                                                                <ItemTitle>{notification.title}</ItemTitle>
                                                                <ItemText>{notification.content}</ItemText>
                                                                <ItemTime>
                                                                    {notification.time || '방금 전'}
                                                                </ItemTime>
                                                            </ItemContent>

                                                            <MenuContainer>
                                                                <MenuButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setVisibleMenu((prev) =>
                                                                            prev === notification.id
                                                                                ? null
                                                                                : notification.id
                                                                        );
                                                                    }}
                                                                >
                                                                    ⋮
                                                                </MenuButton>

                                                                {visibleMenu === notification.id && (
                                                                    <ContextMenu>
                                                                        <ContextMenuItem
                                                                            onClick={(e) =>
                                                                                handleDeleteNotification(
                                                                                    e,
                                                                                    notification.id
                                                                                )
                                                                            }
                                                                        >
                                                                            <DeleteNotificationIcon /> 알림 삭제
                                                                        </ContextMenuItem>

                                                                        <ContextMenuItem
                                                                            onClick={(e) =>
                                                                                handleHideNotification(
                                                                                    e,
                                                                                    notification.id
                                                                                )
                                                                            }
                                                                        >
                                                                            <HideNotificationIcon /> 알림 숨기기
                                                                        </ContextMenuItem>
                                                                    </ContextMenu>
                                                                )}
                                                            </MenuContainer>
                                                        </NotificationItemContainer>
                                                    ))
                                                ) : (
                                                    <EmptyMessage>새로운 알림이 없습니다.</EmptyMessage>
                                                )}
                                            </NotificationList>
                                        </>
                                    )}

                                    <ViewAllNotificationsButton onClick={handleViewAllClick}>
                                        알림 전체보기 &gt;
                                    </ViewAllNotificationsButton>
                                </NotificationDropdown>
                            )}
                        </div>

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
