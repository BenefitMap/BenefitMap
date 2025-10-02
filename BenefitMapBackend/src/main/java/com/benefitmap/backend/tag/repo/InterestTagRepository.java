package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.InterestTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * 관심주제 태그 리포지토리
 * - 활성 태그 조회 (displayOrder 기준 정렬)
 * - 코드 집합으로 조회
 */
public interface InterestTagRepository extends JpaRepository<InterestTag, Short> {

    /** 활성 태그 목록 조회 */
    List<InterestTag> findAllByActiveTrueOrderByDisplayOrderAsc();

    /** 코드 집합으로 태그 조회 */
    List<InterestTag> findByCodeIn(Iterable<String> codes);
}
