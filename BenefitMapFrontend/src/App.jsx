<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './screens/MainPage';
import Page1 from './screens/Page1';
import ServicePage from './screens/ServicePage';
import LoginPage from './screens/LoginPage';
import SettingsPage from './screens/SettingPage';
import Calendar from './screens/calender';
import Page5 from './screens/Page5';
import Page6 from './screens/Page6';
import Header from './components/Header';
import Footer from './components/Footer';
import GlobalStyle from './styles/GlobalStyle'; // ✅ 글로벌 스타일 불러오기

const App = () => {
  return (
    <BrowserRouter>
      {/* 전역 스타일 적용 */}
      <GlobalStyle />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/ServicePage" element={<ServicePage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/SettingsPage" element={<SettingsPage />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/page5" element={<Page5 />} />
            <Route path="/page6" element={<Page6 />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
=======
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle'; // 글로벌 스타일 가져오기
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <>
      <GlobalStyle /> {/* 앱 전체에 글로벌 스타일 적용 */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
>>>>>>> 2d692c974f6b22d02ff6e7be734ff13b3af9a3d2

export default App;