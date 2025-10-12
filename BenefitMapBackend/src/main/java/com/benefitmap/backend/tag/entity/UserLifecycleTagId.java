package com.benefitmap.backend.tag.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * UserLifecycleTag 복합키
 * - (userId, tagId) 구성
 * - 사용자 ↔ 생애주기 태그 매핑에 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class UserLifecycleTagId implements Serializable {

    private Long userId;
    private Short tagId;
}
