package com.benefitmap.backend.tag.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * UserHouseholdTag 복합키
 * - (userId, tagId) 구성
 * - 사용자 ↔ 가구상황 태그 매핑에 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class UserHouseholdTagId implements Serializable {

    private Long userId;
    private Short tagId;
}
