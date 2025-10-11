import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BenefitMapLogo from '../assets/BenefitMapLogo.png';
import mypageIcon from '../assets/mypage.png';
import { handleLogout } from '../utils/auth';
import { colors, fonts, spacing, breakpoints, Dropdown, DropdownItem } from '../styles/CommonStyles';
import { useAuth } from '../hooks/useAuth';
import { useClickOutside } from '../hooks/useClickOutside';

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




// --- 메인 Header 컴포넌트 ---
const Header = () => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // 커스텀 훅 사용
  const { isAuthenticated, user } = useAuth();
  const profileRef = useClickOutside(() => setIsProfileDropdownOpen(false));

  // 프로필 드롭다운 토글 함수 최적화
  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev);
  }, []);

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
        ) : (
          <LoginText onClick={() => navigate('/LoginPage')}>LOGIN</LoginText>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;