package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserHouseholdTag;
import com.benefitmap.backend.tag.entity.UserHouseholdTagId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 사용자 ↔ 가구상황 태그 매핑 리포지토리
 * - 매핑 삭제: userId 기준으로 전체 제거
 */
public interface UserHouseholdTagRepository extends JpaRepository<UserHouseholdTag, UserHouseholdTagId> {

    /** 사용자 ID로 매핑 전체 삭제 */
    void deleteByIdUserId(Long userId);
}
