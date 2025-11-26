// src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// auth 유틸들
import {
    isLoggedIn,
    getUserInfo,
    checkOnboardingStatus, // 서버에서 status === 'ACTIVE' 확인
    fetchUserInfo,         // 서버 /user/me → localStorage.user_info 갱신
} from '../utils/auth';

/**
 * useAuth()
 *
 * 책임:
 * - 현재 로그인 여부 (isAuthenticated)
 * - 현재 로그인 유저 정보 (user)
 * - 아직 로딩 중인지 여부 (isLoading)
 * - 보호 라우트 전용 가드(checkAuthAndRedirect)
 * - 강제 새로고침(refreshAuth)
 * - ✅ 강제 로그아웃/초기화(clearAuthState)
 *
 * 이 훅을 Header, 마이페이지, 보호 라우트 등에서 공통으로 사용하면 됨.
 */
export const useAuth = () => {
    const navigate = useNavigate();

    // 로그인 여부
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 사용자 정보
    // 구조 예시 (utils/auth.fetchUserInfo에서 localStorage에 저장되는 모양):
    // {
    //   id, name, email, picture, gender, age,
    //   regionDo, regionSi,
    //   lifecycleCodes, householdCodes, interestCodes,
    //   status
    // }
    const [user, setUser] = useState(null);

    // 초기 로딩 / 동기화 중인지
    const [isLoading, setIsLoading] = useState(true);

    /**
     * localStorage -> React state 동기화
     *
     * - isLoggedIn() 과 getUserInfo()는 utils/auth.js 쪽에서 관리
     * - 이 함수는 단순히 localStorage의 현재 스냅샷을 state에 반영만 한다
     */
    const syncFromLocal = useCallback(() => {
        const loggedIn = isLoggedIn();
        const userInfo = getUserInfo();

        setIsAuthenticated(loggedIn);
        setUser(userInfo);
    }, []);

    /**
     * ✅ clearAuthState()
     *
     * 1) localStorage에서 로그인 관련 정보 날림
     * 2) 훅 내부 state도 isAuthenticated=false, user=null 로 초기화
     *
     * 이걸 호출하면 헤더 등에서 즉시 "로그아웃 상태 화면"으로 바뀐다.
     * 회원탈퇴 / 수동 로그아웃에서 둘 다 재사용 가능.
     */
    const clearAuthState = useCallback(() => {
        try {
            // 프로젝트에서 쓰는 키 전부 싹 비워주기
            // 실제 키 이름에 맞게 필요한 것들 더 추가해.
            localStorage.removeItem('user_info');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token'); // 쓰고 있으면

            // React state도 초기화
            setIsAuthenticated(false);
            setUser(null);
        } catch (e) {
            console.warn('clearAuthState error:', e);
        }
    }, []);

    /**
     * checkAuthAndRedirect()
     *
     * 보호 라우트에서 호출하는 가드 함수.
     * 1) 로그인 안 돼 있으면 로그인 페이지로 보냄 → false
     * 2) 로그인 돼있는데 아직 온보딩 안 끝났으면 세팅 페이지로 보냄 → false
     * 3) 온보딩 완료(ACTIVE)면 true
     */
    const checkAuthAndRedirect = useCallback(async () => {
        // 로그인 자체가 안돼있으면 로그인 페이지로
        if (!isLoggedIn()) {
            navigate('/LoginPage');
            return false;
        }

        // 서버 기준 유효 사용자? (status === 'ACTIVE' 인지 확인)
        const onboardDone = await checkOnboardingStatus();
        // checkOnboardingStatus()는 내부적으로 fetchUserInfo()를 다시 돌려서
        // 최신 user.status를 보고 ACTIVE인지 판별한다고 가정

        if (onboardDone) {
            // 온보딩 완료 → 진짜 허용
            return true;
        } else {
            // 로그인은 했지만 아직 온보딩 안 끝남 → 세팅 페이지로
            navigate('/SettingPage');
            return false;
        }
    }, [navigate]);

    /**
     * 초기 마운트 시 동작:
     * 1) 우선 localStorage 기준으로 즉시 상태 반영 (헤더 깜빡임 줄이기)
     * 2) 서버(/user/me) 한번 쳐서 user_info 최신화
     *    - fetchUserInfo()가 localStorage.user_info를 업데이트해줌
     *    - 그 다음 syncFromLocal()을 다시 불러서 state 업데이트
     * 3) storage 이벤트 리스너로 다른 탭 변경 반영
     * 4) 주기적으로 localStorage -> state 재동기화 (세션 만료 대비)
     */
    useEffect(() => {
        let mounted = true;

        (async () => {
            // 1) 지금 localStorage snapshot으로 일단 상태 세팅
            syncFromLocal();

            // 2) 서버에 실제로 한 번 물어봐서(쿠키로 인증) 최신값 반영
            const data = await fetchUserInfo(); // 성공 시 localStorage.user_info 갱신됨
            if (mounted) {
                if (data) {
                    // 새로 갱신된 user_info를 다시 state에 동기화
                    syncFromLocal();
                } else {
                    // fetchUserInfo가 실패하면 user_info 지워졌을 수도 있으므로 다시 싱크
                    syncFromLocal();
                }
                setIsLoading(false);
            }
        })();

        // 3) 같은 브라우저 내 다른 탭/윈도우에서 로그인/로그아웃 했을 때 반영
        const handleStorageChange = (e) => {
            if (e.key === 'user_info' || e.key === 'access_token' || e.key === 'refresh_token') {
                syncFromLocal();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // 4) 일정 주기로 한 번씩 로컬 상태 재확인
        const interval = setInterval(() => {
            syncFromLocal();
        }, 10_000); // 10초마다 한 번씩

        return () => {
            mounted = false;
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [syncFromLocal]);

    /**
     * 외부(예: 로그인 직후, 로그아웃 직후 등)에서 강제로 다시 동기화시키고 싶을 때
     * - refreshAuth() 호출하면 localStorage -> state 다시 반영.
     */
    const refreshAuth = useCallback(() => {
        syncFromLocal();
    }, [syncFromLocal]);

    return {
        isAuthenticated,       // boolean
        user,                  // 사용자 객체 (picture 등 포함)
        isLoading,             // 아직 초기 동기화 중인지 여부
        refreshAuth,           // 수동 동기화용
        checkAuthAndRedirect,  // 보호 라우트 가드
        clearAuthState,        // ✅ 로컬 세션 강제 파괴 (회원탈퇴/로그아웃에 사용)
        setUser,               // 필요하면 직접 건드릴 수 있게 그대로 노출
    };
};
