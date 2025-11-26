package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserHouseholdTag;
import com.benefitmap.backend.tag.entity.UserHouseholdTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 사용자 ↔ 가구상황 태그 매핑 리포지토리
 * - 매핑 삭제: userId 기준으로 전체 제거
 * - 코드 조회: userId 기준으로 HouseholdTag.code 목록 반환
 */
public interface UserHouseholdTagRepository extends JpaRepository<UserHouseholdTag, UserHouseholdTagId> {

    /** 사용자 ID로 매핑 전체 삭제 */
    void deleteByIdUserId(Long userId);

    /** 사용자 ID로 가구상황 코드 목록 조회 */
    @Query("""
        select ht.code
        from UserHouseholdTag uht
        join HouseholdTag ht on ht.id = uht.id.tagId
        where uht.id.userId = :userId
    """)
    List<String> findCodesByUserId(@Param("userId") Long userId);
}
