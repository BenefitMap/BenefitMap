import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

// Styles
import GlobalStyle from './styles/GlobalStyle';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton'; // 경로 확인!

// Pages
import MainPage from './screens/MainPage';
import ServicePage from './screens/ServicePage';
import LoginPage from './screens/LoginPage';
import SettingPage from './screens/SettingPage'; 
import Calendar from './screens/Calendar';
import SignupComplete from './screens/SignupComplete';
import OAuthCallback from './screens/OAuthCallback';
import MyPage from './screens/MyPage';
import ServiceDetailPage from './screens/ServiceDetailPage';


const App = () => {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppLayout>
        <Header />
        <MainContent>
          <ContentWrapper>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/ServicePage" element={<ServicePage />} />
              <Route path="/service/:id" element={<ServiceDetailPage />} />
              <Route path="/LoginPage" element={<LoginPage />} />
              <Route path="/SettingPage" element={<SettingPage />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/signup-complete" element={<SignupComplete />} />
              <Route path="/oauth2/callback" element={<OAuthCallback />} />
              <Route path="/mypage" element={<MyPage />} />
            </Routes>
          </ContentWrapper>
        </MainContent>
        <Footer />
        <ScrollToTopButton />
      </AppLayout>
    </BrowserRouter>
  );
};

// Styled Components
const AppLayout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;
  background-color: #ffffff;
  min-height: calc(100vh - 80px);
`;

export default App;