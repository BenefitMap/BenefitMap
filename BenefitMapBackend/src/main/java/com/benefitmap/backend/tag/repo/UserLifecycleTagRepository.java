package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserLifecycleTag;
import com.benefitmap.backend.tag.entity.UserLifecycleTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 사용자 ↔ 생애주기 태그 매핑 리포지토리
 * - 매핑 삭제: userId 기준으로 전체 제거
 * - 코드 조회: userId 기준으로 LifecycleTag.code 목록 반환
 */
public interface UserLifecycleTagRepository extends JpaRepository<UserLifecycleTag, UserLifecycleTagId> {

    /** 사용자 ID로 매핑 전체 삭제 */
    void deleteByIdUserId(Long userId);

    /** 사용자 ID로 생애주기 코드 목록 조회 */
    @Query("""
        select lt.code
        from UserLifecycleTag ult
        join LifecycleTag lt on lt.id = ult.id.tagId
        where ult.id.userId = :userId
    """)
    List<String> findCodesByUserId(@Param("userId") Long userId);
}
