package com.benefitmap.backend.user.enums;

/**
 * 사용자 상태
 * - ACTIVE    : 정상 이용 가능
 * - PENDING   : 가입 직후/검증 대기
 * - SUSPENDED : 이용 정지
 */
public enum UserStatus {
    ACTIVE,
    PENDING,
    SUSPENDED
}
