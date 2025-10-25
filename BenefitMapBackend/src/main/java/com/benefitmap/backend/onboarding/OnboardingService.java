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

import java.util.*;

/**
 * 온보딩 저장 / 조회 서비스
 * - 온보딩 시 프로필/태그를 저장하고, 유저 상태를 ACTIVE로 전환한다.
 * - 온보딩 정보 조회도 제공한다.
 *
 * 변경 사항:
 * - birthDate 대신 age 사용
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
     * 온보딩 데이터 저장(프로필 + 태그 매핑 + 유저 상태 활성화)
     */
    @Transactional
    public void save(Long userId, OnboardingRequest req) {
        // 1. 사용자 확인
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 2. 태그 유효성 검사
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

        // 3. 프로필 저장 (@MapsId - userId = PK)
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

        // 기존: birthDate -> 삭제
        // 변경: age, gender, regionDo, regionSi
        profile.setGender(p.gender());
        profile.setAge(p.age().shortValue()); // UserProfile.age = Short
        profile.setRegionDo(p.regionDo());
        profile.setRegionSi(p.regionSi());
        profileRepo.save(profile);

        // 4. 태그 매핑 갈아끼우기
        // 생애주기
        userLifecycleRepo.deleteByIdUserId(userId);
        life.forEach(t ->
                userLifecycleRepo.save(
                        UserLifecycleTag.builder()
                                .id(new UserLifecycleTagId(userId, t.getId()))
                                .build()
                )
        );

        // 가구상황
        userHouseholdRepo.deleteByIdUserId(userId);
        house.forEach(t ->
                userHouseholdRepo.save(
                        UserHouseholdTag.builder()
                                .id(new UserHouseholdTagId(userId, t.getId()))
                                .build()
                )
        );

        // 관심주제
        userInterestRepo.deleteByIdUserId(userId);
        interest.forEach(t ->
                userInterestRepo.save(
                        UserInterestTag.builder()
                                .id(new UserInterestTagId(userId, t.getId()))
                                .build()
                )
        );

        // 5. 역할/상태 전환 (ADMIN이면 role은 그대로 유지)
        if (user.getRole() != Role.ROLE_ADMIN) {
            user.setRole(Role.ROLE_USER);
        }
        if (user.getStatus() == null || user.getStatus() == UserStatus.PENDING) {
            user.setStatus(UserStatus.ACTIVE);
        }

        userRepo.save(user);
    }

    /**
     * 현재 사용자 온보딩 정보 조회
     * - 프로필(성별/나이/지역)
     * - 선택되어 있는 태그들 상세 정보
     */
    public Map<String, Object> getOnboardingInfo(Long userId) {
        // 1. 사용자 확인
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 2. 프로필 조회
        UserProfile profile = profileRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Onboarding information not found"));

        // 3. 태그 코드 조회
        List<String> lifecycleCodes = userLifecycleRepo.findCodesByUserId(userId);
        List<String> householdCodes = userHouseholdRepo.findCodesByUserId(userId);
        List<String> interestCodes = userInterestRepo.findCodesByUserId(userId);

        // 4. 코드로 태그 상세 조회 (nameKo 등)
        List<LifecycleTag> lifecycleTagEntities = lifecycleRepo.findByCodeIn(lifecycleCodes);
        List<HouseholdTag> householdTagEntities = householdRepo.findByCodeIn(householdCodes);
        List<InterestTag> interestTagEntities = interestRepo.findByCodeIn(interestCodes);

        // 5. 응답 구성
        Map<String, Object> result = new HashMap<>();

        // 프로필 블록
        Map<String, Object> profileInfo = new HashMap<>();
        profileInfo.put("gender", profile.getGender() != null ? profile.getGender().name() : null);
        profileInfo.put("age", profile.getAge()); // Short 그대로 내려줌 (프론트에서 int 필요하면 int로 변환해도 됨)
        profileInfo.put("regionDo", profile.getRegionDo());
        profileInfo.put("regionSi", profile.getRegionSi());
        result.put("profile", profileInfo);

        // 생애주기 태그 상세
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

        // 가구상황 태그 상세
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

        // 관심주제 태그 상세
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
