package com.benefitmap.backend.auth.token;

import jakarta.persistence.*;
import lombok.*;
import com.benefitmap.backend.user.entity.User;

import java.time.Instant;

/**
 * Refresh Token 엔티티
 * - 원문 대신 SHA-256 해시 저장
 * - 만료 인덱스/유니크 제약 적용
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(
        name = "refresh_token",
        uniqueConstraints = @UniqueConstraint(name = "uk_refresh_token_hash", columnNames = "token_hash"),
        indexes = @Index(name = "idx_refresh_expires", columnList = "expires_at")
)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 소유 사용자 */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_refresh_user"))
    private User user;

    /** SHA-256 HEX(64) 해시 */
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    /** 만료 시각 */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /** 폐기 시각(로그아웃 등) */
    @Column(name = "revoked_at")
    private Instant revokedAt;

    /** 생성 시각 */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** INSERT 시 자동 설정 */
    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
