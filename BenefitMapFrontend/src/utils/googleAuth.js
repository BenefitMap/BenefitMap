// 구글 OAuth 유틸리티 함수들 (프론트엔드 전용)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

/**
 * 구글 OAuth 로그인 처리 (백엔드 엔드포인트 사용)
 */
export const handleGoogleLogin = async () => {
  try {
    // 백엔드의 구글 OAuth 엔드포인트로 리다이렉트
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  } catch (error) {
    console.error('Google OAuth 오류:', error);
    throw error;
  }
};

/**
 * 구글 OAuth 토큰으로 사용자 정보 가져오기
 */
export const getUserInfoFromGoogle = async (code) => {
  try {
    // 구글 API로 사용자 정보 가져오기
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'your_client_secret',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: window.location.origin + '/oauth2/callback',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || '토큰 교환 실패');
    }

    // 사용자 정보 가져오기
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userResponse.json();
    
    return {
      ...userInfo,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    throw error;
  }
};

/**
 * 로컬 스토리지에 사용자 정보 저장
 */
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('user_info', JSON.stringify(userInfo));
  localStorage.setItem('access_token', userInfo.accessToken);
  if (userInfo.refreshToken) {
    localStorage.setItem('refresh_token', userInfo.refreshToken);
  }
};

/**
 * 로컬 스토리지에서 사용자 정보 가져오기
 */
export const getUserInfo = () => {
  const userInfoStr = localStorage.getItem('user_info');
  return userInfoStr ? JSON.parse(userInfoStr) : null;
};

/**
 * 로그인 상태 확인
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * 로그아웃 (사용자 정보 제거)
 */
export const logout = () => {
  localStorage.removeItem('user_info');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/LoginPage';
};
