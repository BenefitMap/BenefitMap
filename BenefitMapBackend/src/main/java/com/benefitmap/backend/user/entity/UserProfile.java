package com.benefitmap.backend.user.entity;

import com.benefitmap.backend.user.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.time.Instant;
import java.time.LocalDate;

/**
 * 사용자 프로필 엔티티
 * - PK = users.id 공유 (@MapsId)
 * - Persistable.isNew() 구현으로 save 시 INSERT/UPDATE 구분
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_profile")
public class UserProfile implements Persistable<Long> {

    @Id
    @Setter(AccessLevel.NONE) // 직접 세팅 금지: setUser()로 동기화
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_profile_user"))
    private User user;

    /** 성별 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    /** 생년월일 */
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    /** 지역 (시/도) */
    @Column(name = "region_do", nullable = false, length = 30)
    private String regionDo;

    /** 지역 (시/군/구) */
    @Column(name = "region_si", nullable = false, length = 30)
    private String regionSi;

    /** 생성/수정 시각 */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Persistable: Spring Data가 신규 여부 판단 */
    @Override
    @Transient
    public Long getId() {
        return userId;
    }

    @Override
    @Transient
    public boolean isNew() {
        return this.createdAt == null;
    }

    /** user 세팅 시 PK 동기화 */
    public void setUser(User user) {
        this.user = user;
        this.userId = (user != null ? user.getId() : null);
    }

    @PrePersist
    void prePersist() {
        var now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
