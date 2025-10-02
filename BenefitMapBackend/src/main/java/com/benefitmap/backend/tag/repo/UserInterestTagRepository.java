package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserInterestTag;
import com.benefitmap.backend.tag.entity.UserInterestTagId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 사용자 ↔ 관심주제 태그 매핑 리포지토리
 * - 매핑 삭제: userId 기준으로 전체 제거
 */
public interface UserInterestTagRepository extends JpaRepository<UserInterestTag, UserInterestTagId> {

    /** 사용자 ID로 매핑 전체 삭제 */
    void deleteByIdUserId(Long userId);
}
