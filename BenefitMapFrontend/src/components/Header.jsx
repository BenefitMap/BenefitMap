import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
// 아이콘을 유니코드 문자로 대체
import Notification from './Notification'; // 새로 만든 Notification 컴포넌트 가져오기

const HeaderContainer = styled.header`
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  position: relative; /* 자식 요소의 absolute 포지셔닝 기준 */
`;

const HeaderInner = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`;

const Logo = styled(Link)`
  font-family: 'Times New Roman', Times, serif;
  font-size: 26px;
  font-weight: normal;
  letter-spacing: 1.5px;
  color: #333;
  text-decoration: none;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 50px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-size: 16px;
  font-weight: 500;
  color: #555;
  text-decoration: none; /* 밑줄 제거 */
  transition: color 0.2s ease-in-out;
  
  &:hover {
    color: #000;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const IconWrapper = styled.div`
  font-size: 26px;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
`;

const NotificationBadge = styled.span`
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #E63946;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
`;


const LoginButton = styled(Link)`
  font-family: 'Times New Roman', Times, serif;
  font-size: 16px;
  letter-spacing: 1px;
  font-weight: normal;
  color: #555;
  text-decoration: none; /* 밑줄 제거 */

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuIcon = styled(IconWrapper)`
  font-size: 28px;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo to="/">BENEFIT MAP</Logo>
        <NavLinks>
          <NavLink to="/service">복지 서비스</NavLink>
          <NavLink to="/notification">복지 알림</NavLink>
          <NavLink to="/calendar">알림 캘린더</NavLink>
        </NavLinks>
        <UserActions>
          <IconWrapper onClick={toggleNotification}>
            🔔
            <NotificationBadge>!</NotificationBadge> 
          </IconWrapper>
          <LoginButton to="/login">LOGIN</LoginButton>
          <MenuIcon>
            ☰
          </MenuIcon>
        </UserActions>
      </HeaderInner>
      {isNotificationOpen && <Notification />}
    </HeaderContainer>
  );
};

export default Header;