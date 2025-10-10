// React 및 라우터 관련 라이브러리를 import 합니다.
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 전역 스타일과 공통 컴포넌트(헤더, 푸터)를 import 합니다.
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';

// 각 페이지 컴포넌트들을 import 합니다.
import MainPage from './screens/MainPage';
import Page1 from './screens/Page1';
import ServicePage from './screens/ServicePage';
import LoginPage from './screens/LoginPage';
// ✅ [수정] 파일 이름에 맞게 'SettingsPage' -> 'SettingPage'로 변경
import SettingPage from './screens/SettingPage'; 
import Calendar from './screens/Calendar';
import Page5 from './screens/Page5';
import Page6 from './screens/Page6';
import SignupComplete from './screens/SignupComplete';
import OAuthCallback from './screens/OAuthCallback';
import MyPage from './screens/MyPage';


function App() {
  return (
    <BrowserRouter>
      {/* 앱 전체에 글로벌 스타일을 적용합니다. */}
      <GlobalStyle />
      
      {/* 모든 페이지에 헤더와 푸터가 공통으로 보이도록 구조를 잡습니다. */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        
        {/* 페이지의 실제 내용이 들어가는 메인 영역입니다. */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* 각 URL 경로에 맞는 페이지 컴포넌트를 연결합니다. */}
            <Route path="/" element={<MainPage />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/ServicePage" element={<ServicePage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            {/* ✅ [수정] 경로와 컴포넌트 이름도 'SettingPage'로 통일 */}
            <Route path="/SettingPage" element={<SettingPage />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/page5" element={<Page5 />} />
            <Route path="/page6" element={<Page6 />} />
            <Route path="/signup-complete" element={<SignupComplete />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;