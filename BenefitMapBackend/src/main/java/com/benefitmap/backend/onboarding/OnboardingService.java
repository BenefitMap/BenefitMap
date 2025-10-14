package com.benefitmap.backend.onboarding;

import com.benefitmap.backend.onboarding.dto.OnboardingRequest;
import com.benefitmap.backend.tag.entity.*;
import com.benefitmap.backend.tag.repo.*;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.entity.UserProfile;
import com.benefitmap.backend.user.enums.Role;
import com.benefitmap.backend.user.enums.UserStatus;
import com.benefitmap.backend.user.repo.UserProfileRepository;
import com.benefitmap.backend.user.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

/**
 * 온보딩 저장 서비스
 * - 프로필/태그 검증 후 저장
 * - 사용자 상태를 ACTIVE로, 역할을 USER로 전환(ADMIN 예외)
 */
@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final UserRepository userRepo;
    private final UserProfileRepository profileRepo;
    private final LifecycleTagRepository lifecycleRepo;
    private final HouseholdTagRepository householdRepo;
    private final InterestTagRepository interestRepo;
    private final UserLifecycleTagRepository userLifecycleRepo;
    private final UserHouseholdTagRepository userHouseholdRepo;
    private final UserInterestTagRepository userInterestRepo;

    /**
     * 온보딩 데이터 저장(프로필 + 태그 매핑)
     */
    @Transactional
    public void save(Long userId, OnboardingRequest req) {
        // 사용자 확인
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 태그 유효성 검사
        var life = lifecycleRepo.findByCodeIn(req.lifecycleCodes());
        if (life.size() != req.lifecycleCodes().size()) {
            throw new IllegalArgumentException("유효하지 않은 생애주기 태그가 포함되어 있습니다.");
        }

        var house = householdRepo.findByCodeIn(req.householdCodes());
        if (house.size() != req.householdCodes().size()) {
            throw new IllegalArgumentException("유효하지 않은 가구상황 태그가 포함되어 있습니다.");
        }

        var interestCodes = Optional.ofNullable(req.interestCodes()).orElse(List.of());
        var interest = interestCodes.isEmpty()
                ? List.<InterestTag>of()
                : interestRepo.findByCodeIn(interestCodes);
        if (interest.size() != interestCodes.size()) {
            throw new IllegalArgumentException("유효하지 않은 관심주제 태그가 포함되어 있습니다.");
        }

        // 프로필 저장(@MapsId: userId == PK)
        var p = req.profile();
        UserProfile profile = profileRepo.findById(userId)
                .orElseGet(() -> {
                    UserProfile np = new UserProfile();
                    np.setUser(user);
                    return np;
                });

        if (profile.getUser() == null) {
            profile.setUser(user);
        }
        profile.setGender(p.gender());
        profile.setBirthDate(p.birthDate());
        profile.setRegionDo(p.regionDo());
        profile.setRegionSi(p.regionSi());
        profileRepo.save(profile);

        // 태그 매핑 교체(기존 삭제 → 신규 등록)
        userLifecycleRepo.deleteByIdUserId(userId);
        life.forEach(t ->
                userLifecycleRepo.save(
                        UserLifecycleTag.builder()
                                .id(new UserLifecycleTagId(userId, t.getId()))
                                .build()
                )
        );

        userHouseholdRepo.deleteByIdUserId(userId);
        house.forEach(t ->
                userHouseholdRepo.save(
                        UserHouseholdTag.builder()
                                .id(new UserHouseholdTagId(userId, t.getId()))
                                .build()
                )
        );

        userInterestRepo.deleteByIdUserId(userId);
        interest.forEach(t ->
                userInterestRepo.save(
                        UserInterestTag.builder()
                                .id(new UserInterestTagId(userId, t.getId()))
                                .build()
                )
        );

        // 역할/상태 전환(ADMIN 유지)
        if (user.getRole() != Role.ROLE_ADMIN) {
            user.setRole(Role.ROLE_USER);
        }
        if (user.getStatus() == null || user.getStatus() == UserStatus.PENDING) {
            user.setStatus(UserStatus.ACTIVE);
        }

        userRepo.save(user);
    }

    /**
     * 사용자 온보딩 정보 조회
     */
    public Map<String, Object> getOnboardingInfo(Long userId) {
        // 사용자 확인
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 프로필 정보 조회
        Optional<UserProfile> profileOpt = profileRepo.findById(userId);
        if (profileOpt.isEmpty()) {
            throw new EntityNotFoundException("Onboarding information not found");
        }
        UserProfile profile = profileOpt.get();

        // 태그 정보 조회 - 코드만 가져오기
        List<String> lifecycleCodes = userLifecycleRepo.findCodesByUserId(userId);
        List<String> householdCodes = userHouseholdRepo.findCodesByUserId(userId);
        List<String> interestCodes = userInterestRepo.findCodesByUserId(userId);

        // 결과 구성
        Map<String, Object> result = new HashMap<>();
        
        // 프로필 정보
        Map<String, Object> profileInfo = new HashMap<>();
        profileInfo.put("gender", profile.getGender());
        profileInfo.put("birthDate", profile.getBirthDate());
        profileInfo.put("regionDo", profile.getRegionDo());
        profileInfo.put("regionSi", profile.getRegionSi());
        result.put("profile", profileInfo);

        // 생애주기 태그 - 코드로 태그 정보 조회
        List<LifecycleTag> lifecycleTagEntities = lifecycleRepo.findByCodeIn(lifecycleCodes);
        List<Map<String, Object>> lifecycleTags = lifecycleTagEntities.stream()
                .map(tag -> {
                    Map<String, Object> tagInfo = new HashMap<>();
                    tagInfo.put("code", tag.getCode());
                    tagInfo.put("nameKo", tag.getNameKo());
                    tagInfo.put("displayOrder", tag.getDisplayOrder());
                    tagInfo.put("active", tag.getActive());
                    return tagInfo;
                })
                .toList();
        result.put("lifecycleTags", lifecycleTags);

        // 가구상황 태그 - 코드로 태그 정보 조회
        List<HouseholdTag> householdTagEntities = householdRepo.findByCodeIn(householdCodes);
        List<Map<String, Object>> householdTags = householdTagEntities.stream()
                .map(tag -> {
                    Map<String, Object> tagInfo = new HashMap<>();
                    tagInfo.put("code", tag.getCode());
                    tagInfo.put("nameKo", tag.getNameKo());
                    tagInfo.put("displayOrder", tag.getDisplayOrder());
                    tagInfo.put("active", tag.getActive());
                    return tagInfo;
                })
                .toList();
        result.put("householdTags", householdTags);

        // 관심주제 태그 - 코드로 태그 정보 조회
        List<InterestTag> interestTagEntities = interestRepo.findByCodeIn(interestCodes);
        List<Map<String, Object>> interestTags = interestTagEntities.stream()
                .map(tag -> {
                    Map<String, Object> tagInfo = new HashMap<>();
                    tagInfo.put("code", tag.getCode());
                    tagInfo.put("nameKo", tag.getNameKo());
                    tagInfo.put("displayOrder", tag.getDisplayOrder());
                    tagInfo.put("active", tag.getActive());
                    return tagInfo;
                })
                .toList();
        result.put("interestTags", interestTags);

        return result;
    }
}