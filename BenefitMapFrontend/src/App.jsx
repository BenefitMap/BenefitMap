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

export default App;