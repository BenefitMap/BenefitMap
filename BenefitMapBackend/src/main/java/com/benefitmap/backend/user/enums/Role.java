package com.benefitmap.backend.user.enums;

/**
 * 사용자 권한(Enum)
 *
 * - ROLE_USER       : 일반 사용자
 * - ROLE_ADMIN      : 관리자
 *
 * Spring Security는 내부적으로 "ROLE_" 접두사를 사용하므로
 * Enum 이름에 접두사를 포함해 정의합니다.
 * (DB 저장 시 EnumType.STRING 권장)
 */
public enum Role {
    ROLE_USER,
    ROLE_ADMIN
}
