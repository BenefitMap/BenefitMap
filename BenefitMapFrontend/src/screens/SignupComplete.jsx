import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 130px - 317px); /* Header + Footer 제외 높이 */
  text-align: center;
  padding: 60px 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
`;

const SubText = styled.p`
  color: #666;
  line-height: 1.7;
  margin: 4px 0;
`;

const Button = styled.button`
  margin-top: 28px;
  background: #e9e9e9;
  color: #333;
  border: none;
  padding: 12px 28px;
  border-radius: 22px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #dedede; }
`;

function SignupComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // URL에서 로그인 상태 확인
    const loggedIn = searchParams.get('loggedIn');
    
    if (loggedIn === 'true') {
      // 로그인 상태를 로컬 스토리지에 저장
      localStorage.setItem('access_token', 'google_oauth_token');
      localStorage.setItem('user_info', JSON.stringify({
        name: 'Google User',
        email: 'user@google.com',
        picture: 'https://via.placeholder.com/40'
      }));
    }
    
    // 3초 후 자동으로 설정 페이지로 이동
    const timer = setTimeout(() => {
      navigate('/SettingPage');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <Container>
      <Title>로그인이 완료되었습니다.</Title>
      <SubText>BENEFIT MAP에 오신 것을 환영합니다!</SubText>
      <SubText>복지 혜택과 일정을 한눈에 확인해보세요.</SubText>
      <Button onClick={() => navigate('/SettingPage')}>설정 페이지로 이동</Button>
    </Container>
  );
}

export default SignupComplete;


