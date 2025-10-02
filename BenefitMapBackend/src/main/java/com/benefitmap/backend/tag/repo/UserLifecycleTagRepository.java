package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserLifecycleTag;
import com.benefitmap.backend.tag.entity.UserLifecycleTagId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 사용자 ↔ 생애주기 태그 매핑 리포지토리
 * - 매핑 삭제: userId 기준으로 전체 제거
 */
public interface UserLifecycleTagRepository extends JpaRepository<UserLifecycleTag, UserLifecycleTagId> {

    /** 사용자 ID로 매핑 전체 삭제 */
    void deleteByIdUserId(Long userId);
}
