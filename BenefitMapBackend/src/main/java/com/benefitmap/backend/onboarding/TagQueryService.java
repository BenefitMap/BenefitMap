package com.benefitmap.backend.onboarding;

import com.benefitmap.backend.onboarding.dto.TagDto;
import com.benefitmap.backend.tag.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 온보딩용 태그 조회 서비스
 * - 생애주기 / 가구상황 / 관심주제 태그 반환
 * - 활성화된 태그만 displayOrder 순서로 정렬
 */
@Service
@RequiredArgsConstructor
public class TagQueryService {

    private final LifecycleTagRepository lifecycleRepo;
    private final HouseholdTagRepository householdRepo;
    private final InterestTagRepository interestRepo;

    /** 생애주기 태그 조회 */
    public List<TagDto> findLifecycle() {
        return lifecycleRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder()))
                .toList();
    }

    /** 가구상황 태그 조회 */
    public List<TagDto> findHousehold() {
        return householdRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder()))
                .toList();
    }

    /** 관심주제 태그 조회 */
    public List<TagDto> findInterest() {
        return interestRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder()))
                .toList();
    }
}
