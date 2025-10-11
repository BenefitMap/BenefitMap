package com.benefitmap.backend.tag.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * UserInterestTag 복합키
 * - (userId, tagId) 구성
 * - 사용자 ↔ 관심주제 태그 매핑에 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class UserInterestTagId implements Serializable {

    private Long userId;
    private Short tagId;
}
