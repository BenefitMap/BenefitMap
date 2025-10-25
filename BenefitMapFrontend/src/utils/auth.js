// src/utils/auth.js

// =======================
// 로그인 / 인증 상태
// =======================

/**
 * 지금 로그인된 상태인지 (프론트에서만 쓰는 판별)
 * - 백엔드는 쿠키(ACCESS_TOKEN)로 판단하지만
 * - 프론트 렌더링 용으로 localStorage.user_info 기준으로 true/false 줘
 */
export const isLoggedIn = () => {
  const userInfo = localStorage.getItem('user_info');
  return !!userInfo;
};

/**
 * 현재 로그인한 사용자 정보 (localStorage 버전)
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};


// =======================
// 온보딩 / 설정 여부
// =======================

/**
 * 온보딩(혜택 설정) 완료 여부
 * - 1순위: onboardingCompleted === 'true'
 * - 2순위 fallback: userSettings 필수 필드 다 있는지
 */
export const hasUserSettings = () => {
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  if (onboardingCompleted === 'true') {
    return true;
  }

  const raw = localStorage.getItem('userSettings');
  if (!raw) return false;

  try {
    const settings = JSON.parse(raw);
    const hasRequiredFields = !!(
        settings.region1 &&
        settings.region2 &&
        settings.age &&
        settings.gender &&
        settings.lifeCycle
    );
    return hasRequiredFields;
  } catch (err) {
    console.error('userSettings 파싱 오류:', err);
    return false;
  }
};

/**
 * 로그인 여부 + 온보딩 여부 한번에 체크
 * -> 라우팅 가드 등에서 편하게 쓰려고 만듦
 */
export const checkLoginAndOnboardingStatus = async () => {
  const loggedIn = isLoggedIn();
  if (!loggedIn) {
    return { isLoggedIn: false, isOnboardingCompleted: false };
  }
  return { isLoggedIn: true, isOnboardingCompleted: hasUserSettings() };
};


// =======================
// 백엔드와 통신 helpers
// =======================

/**
 * 백엔드로부터 /user/me 조회해서
 * user_info를 최신화해주는 함수
 * - 서버는 쿠키(ACCESS_TOKEN)를 보고 나를 식별함
 */
export const fetchUserInfo = async () => {
  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const res = await fetch(`${BACKEND_URL}/user/me`, {
      method: 'GET',
      credentials: 'include', // 쿠키 같이 보냄
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        // 미로그인일 수도 있음
        return null;
      }
      throw new Error(`사용자 정보 조회 실패: ${res.status}`);
    }

    const result = await res.json();
    if (result.success && result.data) {
      // 프론트 표시용 최소 정보만 저장
      localStorage.setItem(
          'user_info',
          JSON.stringify({
            name: result.data.name,
            email: result.data.email,
            picture: result.data.imageUrl,
            status: result.data.status, // ACTIVE / PENDING 등
          })
      );
      return result.data;
    }

    return null;
  } catch (err) {
    console.error('fetchUserInfo 오류:', err);
    return null;
  }
};

/**
 * 서버 기준 온보딩 완료인지 확인
 * - 유저 status === 'ACTIVE' 면 온보딩 끝난 걸로 취급
 * - 에러 시엔 localStorage 기반으로 폴백
 */
export const checkOnboardingStatus = async () => {
  try {
    const user = await fetchUserInfo(); // 위에서 localStorage도 갱신돼
    if (user && user.status === 'ACTIVE') {
      return true;
    }
    return false;
  } catch (err) {
    console.error('checkOnboardingStatus 오류:', err);
    return hasUserSettings();
  }
};


// =======================
// 온보딩 관련 API
// =======================

export const fetchLifecycleTags = async () => {
  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const res = await fetch(`${BACKEND_URL}/api/tags/lifecycle`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('생애주기 태그 조회 실패');

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (err) {
    console.error('생애주기 태그 가져오기 오류:', err);
    return [];
  }
};

export const fetchHouseholdTags = async () => {
  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const res = await fetch(`${BACKEND_URL}/api/tags/household`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('가구상황 태그 조회 실패');

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (err) {
    console.error('가구상황 태그 가져오기 오류:', err);
    return [];
  }
};

export const fetchInterestTags = async () => {
  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const res = await fetch(`${BACKEND_URL}/api/tags/interest`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('관심주제 태그 조회 실패');

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (err) {
    console.error('관심주제 태그 가져오기 오류:', err);
    return [];
  }
};

/**
 * 온보딩 저장
 * onboardingData 예시:
 * {
 *   profile: {
 *     gender: "MALE" | "FEMALE",
 *     birthDate: "1995-02-03",
 *     regionDo: "경기도",
 *     regionSi: "수원시"
 *   },
 *   lifecycleCodes: ["YOUTH", ...],
 *   householdCodes: ["LOW_INCOME", "NONE", ...],
 *   interestCodes: ["JOBS", "HOUSING", "NONE", ...]
 * }
 *
 * 요구사항:
 *  - householdCodes: "NONE"이 있어도 그냥 보낸다 (백엔드가 이해)
 *  - interestCodes: "NONE"은 빼고 보낸다
 */
export const saveOnboarding = async (onboardingData) => {
  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const payload = {
      ...onboardingData,
      householdCodes: onboardingData.householdCodes || [],
      interestCodes:
          onboardingData.interestCodes?.filter((code) => code !== 'NONE') || [],
    };

    console.log(
        '전송되는 온보딩 데이터:',
        JSON.stringify(payload, null, 2)
    );

    const res = await fetch(`${BACKEND_URL}/api/onboarding`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorResult = await res.json().catch(() => ({}));
      throw new Error(errorResult.message || '온보딩 저장 실패');
    }

    const result = await res.json();
    return result.success ? result.data : null;
  } catch (err) {
    console.error('온보딩 저장 오류:', err);
    throw err;
  }
};

/**
 * 온보딩 정보 조회
 * - 401: 로그인 안됨
 * - 404: 아직 온보딩 정보 없음
 */
export const fetchOnboardingInfo = async () => {
  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    const res = await fetch(`${BACKEND_URL}/api/onboarding`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 404) {
        return null;
      }
      throw new Error(`온보딩 정보 조회 실패: ${res.status}`);
    }

    const result = await res.json();
    return result.success && result.data ? result.data : null;
  } catch (err) {
    console.error('온보딩 정보 가져오기 오류:', err);
    return null;
  }
};


// =======================
// 로그인 / 로그아웃
// =======================

/**
 * 로그인 버튼 눌렀을 때 호출
 * - Spring Security의 oauth2Login 엔드포인트로 이동
 * - prompt=select_account 을 붙여서 "어떤 계정으로 로그인할래?" 매번 묻도록 강제
 *   (기존 계정 자동 로그인되는 거 방지)
 */
export const handleGoogleLogin = () => {
  const BACKEND_URL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  window.location.href = `${BACKEND_URL}/oauth2/authorization/google?prompt=select_account`;
};

/**
 * 백엔드 로그인 직후 user 정보 받아서
 * 프론트 localStorage에 저장하고 싶을 때 호출
 * (OAuthCallback 같은 곳에서 result.data로 받은 거 넣어도 됨)
 */
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('user_info', JSON.stringify(userInfo));
  // access_token / refresh_token 을 localStorage에 굳이 둘 필요는 없지만
  // 혹시 프론트 로직에서 사용 중이면 유지
  if (userInfo.accessToken) {
    localStorage.setItem('access_token', userInfo.accessToken);
  }
  if (userInfo.refreshToken) {
    localStorage.setItem('refresh_token', userInfo.refreshToken);
  }
};

/**
 * 최종 로그아웃
 * - 서버 /auth/logout 으로 쿠키 만료시키고
 * - 프론트 localStorage 비우고
 * - 페이지 이동
 *
 * navigate 를 넘겨주면 SPA 네비게이션으로 이동하고
 * navigate 없으면 그냥 window.location 으로 이동
 */
export const logout = async (navigate) => {
  const ok = window.confirm('로그아웃 하시겠습니까?');
  if (!ok) return;

  try {
    const BACKEND_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // 쿠키 같이 보내서 서버가 나를 식별하게 함
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('서버 로그아웃 요청 중 오류:', err);
    // 서버 오류가 나더라도 프론트 상태는 지울 거라 계속 진행
  }

  // 프론트 상태 초기화
  localStorage.removeItem('user_info');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // 온보딩 데이터 유지하고 싶으면 아래는 주석 유지
  // localStorage.removeItem('userSettings');
  // localStorage.removeItem('onboardingCompleted');

  // 라우팅
  if (navigate) {
    navigate('/', { replace: true });
  } else {
    window.location.href = '/LoginPage';
  }
};


// =======================
// 라우팅 가드 헬퍼
// =======================

/**
 * 페이지 들어가기 전에 호출해서
 * - 로그인 안 했으면 LoginPage로
 * - 온보딩 안 끝났으면 SettingPage로
 * 보내는 유틸
 *
 * 사용 예:
 *   const ok = checkAuthAndRedirect(navigate);
 *   if (!ok) return null; // 렌더 막기 등
 */
export const checkAuthAndRedirect = (navigate, redirectTo = '/LoginPage') => {
  if (!isLoggedIn()) {
    navigate(redirectTo);
    return false;
  }

  if (!hasUserSettings()) {
    navigate('/SettingPage');
    return false;
  }

  return true;
};
