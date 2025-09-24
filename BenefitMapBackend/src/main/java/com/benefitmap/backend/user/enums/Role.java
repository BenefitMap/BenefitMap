package com.benefitmap.backend.user.enums;

/**
 * 권한 등급(Enum).
 * Spring Security 규칙에 맞춰 접두사 "ROLE_"를 포함해 정의.
 *
 * 사용 예:
 * - hasRole("ADMIN")  → ROLE_ADMIN 매칭
 * - hasAnyRole("USER","ADMIN")
 *
 * (DB에 저장한다면 EnumType.STRING 권장)
 */
public enum Role {
    ROLE_USER,
    ROLE_ADMIN
}
