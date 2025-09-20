package com.benefitmap.backend.user;

/**
 * 사용자 상태
 * - ACTIVE     : 정상 이용 가능 (JwtAuthenticationFilter에서만 인증 통과)
 * - PENDING    : 가입 직후/검증 대기 (인증 불가)
 * - SUSPENDED  : 이용 정지 (인증 불가)
 *
 * 참고: 인증 필터는 상태가 ACTIVE일 때만 SecurityContext에 인증 정보를 설정합니다.
 */
public enum UserStatus {
    ACTIVE, PENDING, SUSPENDED
}
