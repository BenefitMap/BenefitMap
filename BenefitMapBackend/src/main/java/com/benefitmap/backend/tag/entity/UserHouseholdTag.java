package com.benefitmap.backend.tag.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 사용자 ↔ 가구상황 태그 매핑 엔티티
 * - 다대다 관계를 매핑 테이블(user_household_tag)로 표현
 * - PK는 (userId, tagId) 복합키
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_household_tag")
public class UserHouseholdTag {

    @EmbeddedId
    private UserHouseholdTagId id;
}
