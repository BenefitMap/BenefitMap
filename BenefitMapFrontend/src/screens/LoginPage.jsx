import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GoogleLogo from '../assets/google-logo.svg';

// --- 스타일 컴포넌트 정의 ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 130px - 317px); /* 전체 높이에서 Header(130px)와 Footer(317px) 높이 제외 */
`;


const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const LoginBox = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 500;
    margin-bottom: 12px;
  }
  p {
    color: #767676;
    width: 450px;
    margin: 0 auto 30px;
    word-break: keep-all;
  }
`;

const GoogleLoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 450px;
  padding: 12px 24px;
  border: 1px solid #dadce0;
  border-radius: 25px;
  background-color: #91D0A6;
  font-size: 1rem;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  position: relative;

  &:hover {
    background-color: #80c090;
  }

  img {
    width: 20px;
    height: 20px;
    position: absolute;
    left: 24px;
    top: 50%;
    transform: translateY(-50%);
  }
`;


  

// --- 로그인 페이지 컴포넌트 ---
function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/SettingsPage');

  return (
    <PageContainer>
      <MainContent>
        <LoginBox>
          <h1>로그인</h1>
          <p>놓치기 쉬운 복지 혜택, 맞춤 알림으로 설정하세요.</p>
          <GoogleLoginButton onClick={handleLogin}>
            <img src={GoogleLogo} alt="Google logo" />
            Google 계정으로 로그인
          </GoogleLoginButton>
        </LoginBox>
      </MainContent>
    
    </PageContainer>
  );
}

export default LoginPage;