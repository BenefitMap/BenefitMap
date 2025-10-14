// 인증 관련 유틸리티 함수들

/**
 * 로그인 상태 확인 (동기)
 * @returns {boolean} 로그인 여부
 */
export const isLoggedIn = () => {
  // 백엔드는 쿠키 기반 인증을 사용하므로 localStorage의 user_info만으로 판단
  const userInfo = localStorage.getItem('user_info');
  const isLoggedInStatus = !!userInfo;
  console.log('로그인 상태 확인:', { userInfo: !!userInfo, isLoggedIn: isLoggedInStatus });
  return isLoggedInStatus;
};

/**
 * 로그인 상태 및 온보딩 상태 확인 (비동기)
 * @returns {Promise<{isLoggedIn: boolean, isOnboardingCompleted: boolean}>}
 */
export const checkLoginAndOnboardingStatus = async () => {
  const isLoggedInStatus = isLoggedIn();
  
  if (!isLoggedInStatus) {
    return { isLoggedIn: false, isOnboardingCompleted: false };
  }

  // 일단 localStorage 기반으로만 확인 (백엔드 API 문제로 인한 임시 조치)
  const userSettings = hasUserSettings();
  console.log('온보딩 상태 확인 (localStorage 기반):', userSettings);
  return { isLoggedIn: true, isOnboardingCompleted: userSettings };
};

/**
 * 사용자 정보 가져오기
 * @returns {Object|null} 사용자 정보 객체 또는 null
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 혜택 설정 완료 여부 확인
 * @returns {boolean} 혜택 설정 완료 여부
 */
export const hasUserSettings = () => {
  // 온보딩 완료 상태를 먼저 확인
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  console.log('onboardingCompleted:', onboardingCompleted);
  
  if (onboardingCompleted === 'true') {
    console.log('온보딩 완료 상태 확인됨');
    return true;
  }
  
  const userSettings = localStorage.getItem('userSettings');
  console.log('userSettings:', userSettings);
  
  if (!userSettings) {
    console.log('userSettings가 없음');
    return false;
  }
  
  try {
    const settings = JSON.parse(userSettings);
    const hasRequiredFields = !!(settings.region1 && settings.region2 && settings.age && settings.gender && settings.lifeCycle);
    console.log('필수 필드 확인:', hasRequiredFields, settings);
    return hasRequiredFields;
  } catch (error) {
    console.error('설정 정보 파싱 오류:', error);
    return false;
  }
};

/**
 * 로그인 및 혜택 설정 상태 체크 및 리다이렉트
 * @param {Function} navigate - React Router의 navigate 함수
 * @param {string} redirectTo - 리다이렉트할 경로 (기본값: '/LoginPage')
 */
export const checkAuthAndRedirect = (navigate, redirectTo = '/LoginPage') => {
  // 로그인하지 않은 경우
  if (!isLoggedIn()) {
    navigate('/LoginPage');
    return false;
  }
  
  // 로그인은 했지만 혜택 설정을 안 한 경우
  if (!hasUserSettings()) {
    navigate('/SettingPage');
    return false;
  }
  
  return true;
};

/**
 * 백엔드에서 사용자 정보 가져오기
 * @returns {Promise<Object|null>} 사용자 정보 또는 null
 */
export const fetchUserInfo = async () => {
  try {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_URL}/user/me`, {
      method: 'GET',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 401 Unauthorized인 경우 인증되지 않은 상태
      if (response.status === 401) {
        return null;
      }
      throw new Error(`사용자 정보 조회 실패: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      // localStorage에 사용자 정보 저장
      localStorage.setItem('user_info', JSON.stringify({
        name: result.data.name,
        email: result.data.email,
        picture: result.data.imageUrl
      }));
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
};

/**
 * 백엔드에서 온보딩 상태 확인
 * @returns {Promise<boolean>} 온보딩 완료 여부
 */
export const checkOnboardingStatus = async () => {
  try {
    // 백엔드에 온보딩 상태 API가 없으므로 사용자 정보로 확인
    const userInfo = await fetchUserInfo();
    if (userInfo && userInfo.status === 'ACTIVE') {
      return true;
    }
    return false;
  } catch (error) {
    console.error('온보딩 상태 확인 오류:', error);
    // 오류 발생 시 localStorage 기반으로 폴백
    return hasUserSettings();
  }
};

// 온보딩 관련 API 함수들
export const fetchLifecycleTags = async () => {
  try {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_URL}/api/tags/lifecycle`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('생애주기 태그 조회 실패');
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('생애주기 태그 가져오기 오류:', error);
    return [];
  }
};

export const fetchHouseholdTags = async () => {
  try {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_URL}/api/tags/household`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('가구상황 태그 조회 실패');
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('가구상황 태그 가져오기 오류:', error);
    return [];
  }
};

export const fetchInterestTags = async () => {
  try {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_URL}/api/tags/interest`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('관심주제 태그 조회 실패');
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('관심주제 태그 가져오기 오류:', error);
    return [];
  }
};

export const saveOnboarding = async (onboardingData) => {
  try {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    
    // "해당사항 없음" 태그 필터링
    const filteredData = {
      ...onboardingData,
      householdCodes: onboardingData.householdCodes?.filter(code => code !== 'NONE') || [],
      interestCodes: onboardingData.interestCodes?.filter(code => code !== 'NONE') || []
    };
    
    // 디버깅: 전송되는 데이터 확인
    console.log('전송되는 온보딩 데이터:', JSON.stringify(filteredData, null, 2));
    
    const response = await fetch(`${BACKEND_URL}/api/onboarding`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filteredData),
    });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.message || '온보딩 저장 실패');
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('온보딩 저장 오류:', error);
    throw error;
  }
};

/**
 * 백엔드에서 사용자의 온보딩 정보 가져오기
 * @returns {Promise<Object|null>} 온보딩 정보 또는 null
 */
export const fetchOnboardingInfo = async () => {
  try {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${BACKEND_URL}/api/onboarding`, {
      method: 'GET',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 401 Unauthorized인 경우 인증되지 않은 상태
      if (response.status === 401) {
        return null;
      }
      // 404 Not Found인 경우 온보딩 정보가 없는 상태
      if (response.status === 404) {
        return null;
      }
      throw new Error(`온보딩 정보 조회 실패: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('온보딩 정보 가져오기 오류:', error);
    return null;
  }
};

/**
 * 로그아웃 처리
 * @param {Function} navigate - React Router의 navigate 함수
 */
export const handleLogout = async (navigate) => {
  if (window.confirm('로그아웃 하시겠습니까?')) {
    // 클라이언트 사이드에서만 로그아웃 처리 (CORS 문제 해결)
    // localStorage에서 사용자 정보만 삭제 (토큰은 쿠키로 관리됨)
    localStorage.removeItem('user_info');
    // 온보딩 상태는 유지 (userSettings, onboardingCompleted는 삭제하지 않음)
    
    console.log('클라이언트 사이드 로그아웃 완료');
    
    // 페이지 새로고침 없이 바로 메인 페이지로 이동
    navigate('/', { replace: true });
  }
};
