import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

  useEffect(() => {
    // 백엔드 OAuth 성공 후 잠시 대기 후 설정 페이지로 이동
    const timer = setTimeout(() => {
      navigate('/SettingPage');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container>
      <LoadingText>로그인 처리 중...</LoadingText>
      <Spinner />
    </Container>
  );
}

export default OAuthCallback;
