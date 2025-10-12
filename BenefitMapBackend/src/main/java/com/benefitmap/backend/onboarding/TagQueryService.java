package com.benefitmap.backend.onboarding;

import com.benefitmap.backend.onboarding.dto.TagDto;
import com.benefitmap.backend.tag.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 태그 조회 서비스
 * - 온보딩 화면용 태그 목록 조회
 * - 로그인 사용자의 온보딩 태그 코드 조회
 */
@Service
@RequiredArgsConstructor
public class TagQueryService {

    private final LifecycleTagRepository lifecycleRepo;
    private final HouseholdTagRepository householdRepo;
    private final InterestTagRepository interestRepo;

    private final UserLifecycleTagRepository userLifecycleRepo;
    private final UserHouseholdTagRepository userHouseholdRepo;
    private final UserInterestTagRepository userInterestRepo;

    /**
     * 생애주기 태그 목록 조회
     * - 활성 태그만 displayOrder 순으로 반환
     */
    public List<TagDto> findLifecycle() {
        return lifecycleRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder()))
                .toList();
    }

    /**
     * 가구상황 태그 목록 조회
     * - 활성 태그만 displayOrder 순으로 반환
     */
    public List<TagDto> findHousehold() {
        return householdRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder()))
                .toList();
    }

    /**
     * 관심주제 태그 목록 조회
     * - 활성 태그만 displayOrder 순으로 반환
     */
    public List<TagDto> findInterest() {
        return interestRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder()))
                .toList();
    }

    /**
     * 사용자 온보딩 태그 코드 조회
     * - 생애주기 / 가구상황 / 관심주제별 코드 리스트 반환
     */
    public UserTagCodes getUserTagCodes(Long userId) {
        List<String> lifecycles = userLifecycleRepo.findCodesByUserId(userId);
        List<String> households = userHouseholdRepo.findCodesByUserId(userId);
        List<String> interests  = userInterestRepo.findCodesByUserId(userId);
        return new UserTagCodes(lifecycles, households, interests);
    }

    /**
     * 사용자 온보딩 태그 코드 묶음
     * - 생애주기 / 가구상황 / 관심주제
     */
    public record UserTagCodes(
            List<String> lifecycles,
            List<String> households,
            List<String> interests
    ) {}
}
