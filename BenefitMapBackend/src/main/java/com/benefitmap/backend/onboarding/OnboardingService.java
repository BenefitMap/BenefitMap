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

        // 디버깅: 받은 요청 데이터 로깅
        System.out.println("받은 온보딩 요청:");
        System.out.println("생애주기 코드: " + req.lifecycleCodes());
        System.out.println("가구상황 코드: " + req.householdCodes());
        System.out.println("관심주제 코드: " + req.interestCodes());

        // 태그 유효성 검사
        var life = lifecycleRepo.findByCodeIn(req.lifecycleCodes());
        System.out.println("찾은 생애주기 태그 수: " + life.size() + ", 요청 수: " + req.lifecycleCodes().size());
        if (life.size() != req.lifecycleCodes().size()) {
            throw new IllegalArgumentException("유효하지 않은 생애주기 태그가 포함되어 있습니다.");
        }

        var householdCodes = Optional.ofNullable(req.householdCodes()).orElse(List.of());
        var house = householdCodes.isEmpty()
                ? List.<HouseholdTag>of()
                : householdRepo.findByCodeIn(householdCodes);
        System.out.println("찾은 가구상황 태그 수: " + house.size() + ", 요청 수: " + householdCodes.size());
        System.out.println("찾은 가구상황 태그: " + house.stream().map(h -> h.getCode()).toList());
        if (house.size() != householdCodes.size()) {
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
}
