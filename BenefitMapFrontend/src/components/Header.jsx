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

/* =========================
   ⚠ 서비스 공지 안내바 스타일
   ========================= */
const AlertBar = styled.div`
    width: 100%;
    background-color: #fff8e1; /* 옅은 노랑 (경고 느낌) */
    border-bottom: 1px solid #f0d98a;
    color: #8a6d00;
    font-size: 13px;
    line-height: 1.4;
    font-family: ${fonts.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    text-align: center;

    /* 긴 문구가 모바일에서 두 줄로 자연스럽게 떨어지도록 */
    @media (max-width: ${breakpoints.mobile}) {
        font-size: 12px;
        padding: 8px 10px;
    }
`;

/* 아이콘 느낌의 강조 (작은 점/느낌표 등) */
const AlertPrefix = styled.span`
    font-weight: ${fonts.weights.bold};
    margin-right: 6px;
    color: #b25a00;
`;

/* =========================
   기존 헤더 스타일
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

/* =========================
   컴포넌트
   ========================= */
const Header = () => {
    const navigate = useNavigate();

    // 전역 인증 여부
    const { isAuthenticated } = useAuth() || { isAuthenticated: false };

    // 헤더에서 즉시 반영할 로그인 여부
    const [authView, setAuthView] = useState(isAuthenticated);

    // 프로필 드롭다운 열림 여부
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // 현재 프로필 이미지 (없으면 기본 아이콘)
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    // 드롭다운 밖 클릭 시 닫기
    const profileRef = useClickOutside(() => setIsProfileDropdownOpen(false));

    // 전역 로그인 상태 변화 → 로컬 authView 반영
    useEffect(() => {
        setAuthView(isAuthenticated);
    }, [isAuthenticated]);

    // 로그인 상태일 때만 /user/me 호출해서 이미지 세팅
    useEffect(() => {
        if (!authView) {
            setProfileImageUrl(null);
            return;
        }

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
    }, [authView]);

    // 프로필 드롭다운 토글
    const toggleProfileDropdown = useCallback(() => {
        setIsProfileDropdownOpen((prev) => !prev);
    }, []);

    // 마이페이지 이동
    const handleMyPageClick = useCallback(() => {
        navigate('/mypage');
        setIsProfileDropdownOpen(false);
    }, [navigate]);

    // 로그아웃
    const handleLogoutClick = useCallback(() => {
        logout(navigate);
        setAuthView(false);
        setProfileImageUrl(null);
        setIsProfileDropdownOpen(false);
    }, [navigate]);

    return (
        <>
            {/* ⬆ 최상단 경고/공지 바 */}
            <AlertBar>
                <AlertPrefix>※ 안내</AlertPrefix>
                최근 국가정보자원관리원 화재 사고로 인하여 API 장애가 발생하여
                임시 데이터로 시연 중입니다.
            </AlertBar>

            {/* ⬇ 기존 헤더 */}
            <HeaderContainer>
                {/* 왼쪽: 로고 + 메뉴 */}
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

                {/* 오른쪽: 로그인 / 프로필 */}
                <RightSection>
                    {authView ? (
                        <div
                            ref={profileRef}
                            style={{ position: 'relative' }}
                        >
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
                    ) : (
                        <LoginText
                            onClick={() => navigate('/LoginPage')}
                        >
                            LOGIN
                        </LoginText>
                    )}
                </RightSection>
            </HeaderContainer>
        </>
    );
};

export default Header;
