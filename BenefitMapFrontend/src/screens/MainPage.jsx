import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Footer from '../components/Footer';
import { isLoggedIn, hasUserSettings } from '../utils/auth';

const Container = styled.div`
  padding: 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  font-size: 2.5rem;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.2rem;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled(Link)`
  display: block;
  padding: 15px 30px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const SetupBanner = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const SetupTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.3rem;
`;

const SetupText = styled.p`
  margin: 0 0 15px 0;
  opacity: 0.9;
`;

const SetupButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const MainPage = () => {
  const navigate = useNavigate();
  const [showSetupBanner, setShowSetupBanner] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인
    const accessToken = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    
    console.log('MainPage - 로그인 상태 체크:', {
      accessToken: !!accessToken,
      userInfo: !!userInfo,
      isLoggedIn: isLoggedIn()
    });
    
    // 로그인되어 있지만 혜택 설정이 안 되어 있으면 강제로 설정 페이지로 이동
    if (isLoggedIn() && !hasUserSettings()) {
      console.log('MainPage - 로그인됨, 설정 미완료, SettingPage로 이동');
      navigate('/SettingPage');
      return;
    }

    // 로그인 상태와 관계없이 메인페이지 표시
    console.log('MainPage - 메인페이지 표시');
    setShowSetupBanner(!isLoggedIn()); // 로그인되지 않은 경우에만 설정 배너 표시
  }, [navigate]);

  const handleSetupClick = () => {
    navigate('/SettingPage');
  };

  return (
    <Container>
      <Title>메인 페이지</Title>
      <Description>복지 혜택과 일정을 한눈에 확인해보세요!</Description>
      
      {showSetupBanner && (
        <SetupBanner>
          <SetupTitle>맞춤 혜택을 받아보세요!</SetupTitle>
          <SetupText>
            간단한 정보를 입력하면 나에게 꼭 맞는 복지 혜택을 추천해드립니다.
          </SetupText>
          <SetupButton onClick={handleSetupClick}>
            혜택 맞춤 설정하기
          </SetupButton>
        </SetupBanner>
      )}
      
      <ButtonGrid>
        <PageButton to="/page1">📄 Page 1</PageButton>
        <PageButton to="/ServicePage">📄 ServicePage</PageButton>
        <PageButton to="/LoginPage">📄 LoginPage</PageButton>
        <PageButton to="/calendar">📅 캘린더</PageButton>
        <PageButton to="/page5">📄 Page 5</PageButton>
        <PageButton to="/page6">📄 Page 6</PageButton>
      </ButtonGrid>
    </Container>
  );
};

export default MainPage;