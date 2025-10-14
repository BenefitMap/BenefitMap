import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { hasUserSettings, fetchUserInfo } from '../utils/auth';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 130px - 317px);
  text-align: center;
  padding: 60px 20px;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #91D0A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function OAuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setLoading(true);
        
        // 잠시 대기 후 백엔드에서 사용자 정보 가져오기
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 백엔드에서 사용자 정보 가져오기
        const userInfo = await fetchUserInfo();
        
        console.log('OAuth 콜백 - 사용자 정보:', userInfo);
        console.log('사용자 상태:', userInfo.status);
        
        if (!userInfo) {
          throw new Error('사용자 정보를 가져올 수 없습니다');
        }
        
        // 백엔드에서 쿠키로 토큰을 관리하므로 별도 토큰 저장 불필요
        
        // 온보딩 완료 여부 확인
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        console.log('온보딩 완료 상태:', onboardingCompleted);
        
        // 첫 로그인인지 확인 (사용자 상태가 PENDING이거나 온보딩이 완료되지 않은 경우)
        const isFirstLogin = userInfo.status === 'PENDING' || 
                            userInfo.status === undefined || 
                            userInfo.status === null || 
                            onboardingCompleted !== 'true';
        
        console.log('첫 로그인 여부:', isFirstLogin);
        
        if (isFirstLogin) {
          // 첫 로그인 또는 온보딩 미완료인 경우 설정페이지로 이동
          console.log('설정 페이지로 이동 - 첫 로그인');
          navigate('/SettingPage');
        } else {
          // 온보딩이 완료된 경우 메인페이지로 이동
          console.log('메인 페이지로 이동 - 온보딩 완료');
          navigate('/');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setError(error.message);
        // 오류 발생 시 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/LoginPage');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <Container>
        <LoadingText>로그인 처리 중 오류가 발생했습니다.</LoadingText>
        <LoadingText style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{error}</LoadingText>
        <LoadingText style={{ fontSize: '0.8rem' }}>잠시 후 로그인 페이지로 이동합니다...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingText>로그인 처리 중...</LoadingText>
      <Spinner />
    </Container>
  );
}

export default OAuthCallback;
