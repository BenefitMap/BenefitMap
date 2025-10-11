import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { hasUserSettings } from '../utils/auth';

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
      // 설정 정보가 완전하면 메인페이지로, 없거나 불완전하면 설정페이지로
      if (hasUserSettings()) {
        // 설정 완료 후 성공 메시지 표시 후 메인페이지로 이동
        const timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // 설정이 완료되지 않은 경우 설정페이지로 이동 (loggedIn 파라미터 제거)
        navigate('/SettingPage', { replace: true });
      }
    }
  }, [navigate, searchParams]);

  const loggedIn = searchParams.get('loggedIn');
  const isSettingsComplete = hasUserSettings();

  return (
    <Container>
      <Title>
        {isSettingsComplete ? '설정이 완료되었습니다!' : '로그인이 완료되었습니다.'}
      </Title>
      <SubText>BENEFIT MAP에 오신 것을 환영합니다!</SubText>
      <SubText>
        {isSettingsComplete 
          ? '이제 개인 맞춤형 혜택 서비스를 이용하실 수 있습니다.' 
          : '복지 혜택과 일정을 한눈에 확인해보세요.'
        }
      </SubText>
      {!isSettingsComplete && (
        <Button onClick={() => navigate('/SettingPage')}>혜택 설정하러 가기</Button>
      )}
    </Container>
  );
}

export default SignupComplete;


