import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './screens/MainPage';
import Page1 from './screens/Page1';
import ServicePage from './screens/ServicePage';
import LoginPage from './screens/LoginPage';
import SettingsPage from './screens/SettingsPage';
import Page4 from './screens/Page4';
import Page5 from './screens/Page5';
import Page6 from './screens/Page6';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <BrowserRouter>
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/ServicePage" element={<ServicePage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/SettingsPage" element={<SettingsPage />} />
            <Route path="/page4" element={<Page4 />} />
            <Route path="/page5" element={<Page5 />} />
            <Route path="/page6" element={<Page6 />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;