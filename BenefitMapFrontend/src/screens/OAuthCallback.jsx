// src/screens/OAuthCallback.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 130px - 317px);
  text-align: center;
  padding: 60px 20px;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #91D0A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // 쿠키(세션) 세팅 안정화 약간 대기
        await new Promise(r => setTimeout(r, 500));

        // 백엔드 세션 기반으로 /user/me 호출 (쿠키 포함)
        const res = await fetch(`${API_BASE}/user/me`, {
          method: 'GET',
          credentials: 'include',
        });

        console.log('[OAuthCallback] /user/me status =', res.status);

        // 1) 신규 유저 (아직 온보딩/프로필 없음)
        //    백엔드가 404를 주는 케이스
        if (res.status === 404) {
          console.log('[OAuthCallback] 신규 유저: 세팅페이지로 이동');
          // ✅ 여기 state: { from: 'oauth' } 추가
          navigate('/SettingPage', { replace: true, state: { from: 'oauth' } });
          return;
        }

        // 2) 인증 실패 or 세션 문제
        if (res.status === 401) {
          console.warn('[OAuthCallback] 인증 안됨. 로그인 페이지로 이동');
          setError('로그인이 만료되었습니다. 다시 로그인 해주세요.');
          setTimeout(() => {
            navigate('/LoginPage', { replace: true });
          }, 1500);
          return;
        }

        // 3) 정상 유저 (온보딩까지 완료된 상태)
        if (res.status === 200) {
          const json = await res.json().catch(() => null);
          console.log('[OAuthCallback] 기존 유저 로그인 성공:', json?.data);
          navigate('/', { replace: true }); // 메인으로
          return;
        }

        // 4) 기타 예외
        console.error('[OAuthCallback] 예상 못한 응답 코드:', res.status);
        setError('알 수 없는 오류가 발생했습니다.');
        setTimeout(() => {
          navigate('/LoginPage', { replace: true });
        }, 1500);

      } catch (err) {
        console.error('[OAuthCallback] 처리 중 오류:', err);
        setError('서버와 통신할 수 없습니다.');
        setTimeout(() => {
          navigate('/LoginPage', { replace: true });
        }, 1500);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (error) {
    return (
        <Container>
          <LoadingText>로그인 처리 중 오류가 발생했습니다.</LoadingText>
          <LoadingText style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
            {error}
          </LoadingText>
          <LoadingText style={{ fontSize: '0.8rem' }}>
            잠시 후 로그인 페이지로 이동합니다...
          </LoadingText>
        </Container>
    );
  }

  return (
      <Container>
        <LoadingText>로그인 처리 중...</LoadingText>
        <Spinner />
      </Container>
  );
}

export default OAuthCallback;
