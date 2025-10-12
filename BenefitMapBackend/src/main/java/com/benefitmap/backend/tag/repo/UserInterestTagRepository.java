package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserInterestTag;
import com.benefitmap.backend.tag.entity.UserInterestTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 사용자 ↔ 관심주제 태그 매핑 리포지토리
 * - 매핑 삭제: userId 기준으로 전체 제거
 * - 코드 조회: userId 기준으로 InterestTag.code 목록 반환
 */
public interface UserInterestTagRepository extends JpaRepository<UserInterestTag, UserInterestTagId> {

    /** 사용자 ID로 매핑 전체 삭제 */
    void deleteByIdUserId(Long userId);

    /** 사용자 ID로 관심주제 코드 목록 조회 */
    @Query("""
        select it.code
        from UserInterestTag uit
        join InterestTag it on it.id = uit.id.tagId
        where uit.id.userId = :userId
    """)
    List<String> findCodesByUserId(@Param("userId") Long userId);
}
