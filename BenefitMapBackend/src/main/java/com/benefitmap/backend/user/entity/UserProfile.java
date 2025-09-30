package com.benefitmap.backend.user.entity;

import com.benefitmap.backend.user.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.Persistable;

import java.time.Instant;
import java.time.LocalDate;

/**
 * UserProfile
 * - PK는 users.id와 공유 (@MapsId)
 * - 새 엔티티 판단은 Persistable.isNew()로 제어 → save()가 INSERT/UPDATE를 정확히 선택
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
    @Setter(AccessLevel.NONE) // 직접 세팅 금지: setUser(...)가 동기화해줌
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_profile_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "region_do", nullable = false, length = 30)
    private String regionDo;

    @Column(name = "region_si", nullable = false, length = 30)
    private String regionSi;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Persistable 구현: Spring Data가 INSERT/UPDATE를 올바르게 선택하도록 */
    @Override
    @Transient
    public Long getId() {
        return userId;
    }

    @Override
    @Transient
    public boolean isNew() {
        // createdAt은 @PrePersist 때 채워짐 → null 이면 새 엔티티로 간주
        return this.createdAt == null;
    }

    /** user 세팅 시 @MapsId 규칙에 따라 PK 동기화 */
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
