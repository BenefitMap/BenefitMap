package com.benefitmap.backend.user.entity;

import com.benefitmap.backend.user.enums.Role;
import com.benefitmap.backend.user.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 *
 * - OAuth2 계정 연결: (provider, provider_id) 유니크
 * - 이메일 유니크(utf8mb4 인덱스 고려 191자)
 * - 권한/상태는 Enum STRING 저장, 기본 ROLE_USER / PENDING
 * - 생성/수정 시각 자동 설정
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_provider_pid", columnNames = {"provider", "provider_id"})
        }
)
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** OAuth2 제공자명 (예: google) */
    @Column(length = 20)
    private String provider;

    /** 제공자 내 고유 식별자(sub 등) */
    @Column(name = "provider_id", length = 100)
    private String providerId;

    /** 로그인/연락용 이메일 (유니크) */
    @Column(nullable = false, length = 191)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    /** 권한 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    /** 가입/이용 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING;

    private LocalDateTime lastLoginAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** INSERT 시각 자동 설정 */
    @PrePersist
    void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    /** UPDATE 시각 자동 설정 */
    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
