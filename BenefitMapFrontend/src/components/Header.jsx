import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BenefitMapLogo from '../assets/BenefitMapLogo.png';
import menubar from '../assets/menubar.png';

const HeaderContainer = styled.header`
  width: 100%;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #d0d0d0;
  box-sizing: border-box;
  
  @media (max-width: 1200px) {
    padding: 0 20px;
  }
  
  @media (max-width: 768px) {
    height: 80px;
    padding: 0 15px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 100px;
  
  @media (max-width: 1200px) {
    gap: 50px;
  }
  
  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const Logo = styled.img`
  height: 32px;
  cursor: pointer;
  display: block;
  
  @media (max-width: 768px) {
    height: 24px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 70px;
  
  @media (max-width: 1200px) {
    gap: 40px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.a`
  font-size: 18px;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  font-weight: 400;
  white-space: nowrap;
  
  &:hover {
    opacity: 0.7;
  }
  
  @media (max-width: 1200px) {
    font-size: 16px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 50px;
  
  @media (max-width: 1200px) {
    gap: 30px;
  }
  
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const LoginText = styled.span`
  font-size: 18px;
  color: #000000;
  font-weight: 400;
  letter-spacing: 2px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.7;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    letter-spacing: 1px;
  }
`;

const MenuIcon = styled.img`
  width: 35px;
  height: 35px;
  cursor: pointer;
  object-fit: contain;
  display: block;
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  return (
    <HeaderContainer>
      <LeftSection>
        <Logo src={BenefitMapLogo} alt="Benefit Map" onClick={() => navigate('/')} onError={(e) => console.log('Logo failed to load:', e)} />
        <Nav>
          <NavItem href="#service">복지 서비스</NavItem>
          <NavItem href="#algorithm">복지 알림</NavItem>
          <NavItem href="#calendar">알림 캘린더</NavItem>
        </Nav>
      </LeftSection>
      <RightSection>
        <LoginText onClick={() => navigate('/LoginPage')}>LOGIN</LoginText>
        <MenuIcon src={menubar} alt="Menu" onError={(e) => console.log('Menu icon failed to load:', e)} />
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;