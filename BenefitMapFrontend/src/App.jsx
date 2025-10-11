import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';

// Styles
import GlobalStyle from './styles/GlobalStyle';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import MainPage from './screens/MainPage';
import ServicePage from './screens/ServicePage';
import LoginPage from './screens/LoginPage';
import SettingPage from './screens/SettingPage'; 
import Calendar from './screens/Calendar';
import SignupComplete from './screens/SignupComplete';
import OAuthCallback from './screens/OAuthCallback';
import MyPage from './screens/MyPage';


const App = () => {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppLayout>
        <Header />
        <Main>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/ServicePage" element={<ServicePage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/SettingPage" element={<SettingPage />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/signup-complete" element={<SignupComplete />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </Main>
        <Footer />
      </AppLayout>
    </BrowserRouter>
  );
};

// Styled Components
const AppLayout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
`;

export default App;