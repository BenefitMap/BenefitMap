package com.benefitmap.backend.user.dto;

import java.util.List;

/**
 * 마이페이지 조회 응답 DTO
 * - 이름 / 이메일 / 프로필이미지: Google에서 온 값 (수정 불가)
 * - gender / age / regionDo / regionSi: 수정 가능
 * - 태그: 코드 목록
 */
public record MyPageResponse(
        Long userId,
        BasicInfo basic,
        ProfileInfo profile,
        TagInfo tags
) {
    public record BasicInfo(
            String name,
            String email,
            String imageUrl,
            String gender,  // 예: "MALE"
            Integer age     // 예: 12
    ) {}

    public record ProfileInfo(
            String regionDo,   // 예: "서울특별시"
            String regionSi    // 예: "종로구"
    ) {}

    public record TagInfo(
            List<String> lifecycleCodes,   // 예: ["TEEN"]
            List<String> householdCodes,   // 예: ["NONE"]
            List<String> interestCodes     // 예: ["MENTAL_HEALTH", "JOBS"]
    ) {}
}
