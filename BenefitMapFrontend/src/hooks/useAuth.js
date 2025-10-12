import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, getUserInfo, hasUserSettings } from '../utils/auth';

/**
 * 인증 상태를 관리하는 커스텀 훅
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(() => {
    const loggedIn = isLoggedIn();
    const userInfo = getUserInfo();
    
    console.log('useAuth - 로그인 상태 확인:', { loggedIn, userInfo: !!userInfo });
    setIsAuthenticated(loggedIn);
    setUser(userInfo);
    setIsLoading(false);
  }, []);

  // 로그아웃 함수 추가
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    
    // 주기적으로 상태 확인 (1초마다)
    const interval = setInterval(checkAuthStatus, 1000);
    
    // localStorage 변경 이벤트 리스너
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'user_info') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthStatus]);

  const checkAuthAndRedirect = useCallback((redirectTo = '/LoginPage') => {
    if (!isAuthenticated) {
      navigate(redirectTo);
      return false;
    }
    
    if (!hasUserSettings()) {
      navigate('/SettingPage');
      return false;
    }
    
    return true;
  }, [isAuthenticated, navigate]);

  return {
    isAuthenticated,
    user,
    isLoading,
    checkAuthAndRedirect,
    refreshAuth: checkAuthStatus,
    logout,
  };
};
