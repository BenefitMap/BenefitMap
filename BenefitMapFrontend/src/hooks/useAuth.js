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
    
    setIsAuthenticated(loggedIn);
    setUser(userInfo);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    
    // localStorage 변경 이벤트 리스너
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'user_info') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
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
  };
};
