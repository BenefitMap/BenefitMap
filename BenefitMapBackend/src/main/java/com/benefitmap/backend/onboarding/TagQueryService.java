package com.benefitmap.backend.onboarding;

import com.benefitmap.backend.onboarding.dto.TagDto;
import com.benefitmap.backend.tag.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagQueryService {
    private final LifecycleTagRepository lifecycleRepo;
    private final HouseholdTagRepository householdRepo;
    private final InterestTagRepository interestRepo;

    public List<TagDto> findLifecycle() {
        return lifecycleRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder())).toList();
    }

    public List<TagDto> findHousehold() {
        return householdRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder())).toList();
    }

    public List<TagDto> findInterest() {
        return interestRepo.findAllByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(t -> new TagDto(t.getId(), t.getCode(), t.getNameKo(), t.getDisplayOrder())).toList();
    }
}
