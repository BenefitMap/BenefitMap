// 구글 OAuth 유틸리티 함수들 (백엔드 OAuth2 엔드포인트 사용)

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
 * 구글 OAuth 콜백 처리 (백엔드에서 처리되므로 사용하지 않음)
 * @deprecated 백엔드 OAuth2 엔드포인트를 사용하므로 이 함수는 사용하지 않습니다.
 */
export const getUserInfoFromGoogle = async (code) => {
  console.warn('getUserInfoFromGoogle은 더 이상 사용되지 않습니다. 백엔드 OAuth2 엔드포인트를 사용하세요.');
  throw new Error('이 함수는 더 이상 사용되지 않습니다.');
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
