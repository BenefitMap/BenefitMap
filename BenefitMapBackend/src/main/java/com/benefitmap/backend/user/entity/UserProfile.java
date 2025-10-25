package com.benefitmap.backend.user.entity;

import com.benefitmap.backend.user.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_profile")
public class UserProfile {

    @Id
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    // ✅ 여기 추가
    @Column(nullable = false)
    private Short age;

    @Column(nullable = false)
    private String regionDo;

    @Column(nullable = false)
    private String regionSi;

    @Column(nullable = false, updatable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
}
