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

    @Transactional
    public void save(Long userId, OnboardingRequest req) {
        // 사용자 조회
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // ----- 태그 유효성 검증 및 조회 -----
        var life = lifecycleRepo.findByCodeIn(req.lifecycleCodes());
        if (life.size() != req.lifecycleCodes().size()) {
            throw new IllegalArgumentException("유효하지 않은 생애주기 태그가 포함되어 있습니다.");
        }

        var house = householdRepo.findByCodeIn(req.householdCodes());
        if (house.size() != req.householdCodes().size()) {
            throw new IllegalArgumentException("유효하지 않은 가구/취약 태그가 포함되어 있습니다.");
        }

        var interestCodes = Optional.ofNullable(req.interestCodes()).orElse(List.of());
        var interest = interestCodes.isEmpty()
                ? List.<InterestTag>of()
                : interestRepo.findByCodeIn(interestCodes);
        if (interest.size() != interestCodes.size()) {
            throw new IllegalArgumentException("유효하지 않은 관심사 태그가 포함되어 있습니다.");
        }

        // ----- 프로필 저장 (@MapsId + Persistable.isNew 로 INSERT 보장) -----
        var p = req.profile();
        UserProfile profile = profileRepo.findById(userId)
                .orElseGet(() -> {
                    UserProfile np = new UserProfile();
                    // @MapsId: PK(userId) 동기화. Persistable.isNew()=true → persist
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

        profileRepo.save(profile); // 새면 INSERT, 기존이면 UPDATE

        // ----- 매핑 테이블 교체(삭제 후 일괄 등록) -----
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

        // ----- 역할/상태 전환 -----
        // 관리자(ROLE_ADMIN)는 그대로 두고, 그 외는 ROLE_USER로 고정
        if (user.getRole() != Role.ROLE_ADMIN) {
            user.setRole(Role.ROLE_USER);
        }
        // 상태는 PENDING(null 포함) → ACTIVE
        if (user.getStatus() == null || user.getStatus() == UserStatus.PENDING) {
            user.setStatus(UserStatus.ACTIVE);
        }

        userRepo.save(user);
    }
}
