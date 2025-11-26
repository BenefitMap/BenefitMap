package com.benefitmap.backend.onboarding.dto;

import com.benefitmap.backend.user.enums.Gender;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * 온보딩 요청 DTO
 * - 회원가입 후 추가정보 입력(온보딩) 시 클라이언트에서 전달되는 데이터 구조
 * - 내부적으로 Profile 정보 + 선택된 태그 코드 목록을 포함한다.
 *
 * 변경 사항:
 * - 기존 birthDate(생년월일) 대신 age(나이, 정수)로 전송받는다.
 */
public record OnboardingRequest(

        /**
         * 생애주기 태그 코드 목록
         * - 최소 1개 이상 선택해야 함
         *   예: ["TEEN"], ["YOUTH"]
         */
        @Size(min = 1, message = "생애주기 태그는 최소 1개 이상 선택하세요.")
        List<@NotBlank String> lifecycleCodes,

        /**
         * 가구상황 태그 코드 목록
         * - 최소 1개 이상 선택해야 함
         *   예: ["LOW_INCOME", "NONE"]
         */
        @Size(min = 1, message = "가구상황 태그는 최소 1개 이상 선택하세요.")
        List<@NotBlank String> householdCodes,

        /**
         * 관심주제 태그 코드 목록
         * - 선택 사항(0개 이상 가능)
         *   예: ["JOBS","MENTAL_HEALTH"]
         */
        @Size(min = 0)
        List<@NotBlank String> interestCodes,

        /**
         * 유저 프로필 정보
         * - 성별, 나이, 지역 정보 포함
         */
        @NotNull Profile profile
) {

    /**
     * 온보딩 프로필 정보
     * - gender: 성별 (enum Gender)
     * - age: 나이(정수)
     * - regionDo / regionSi: 시/도 / 시/구
     */
    public record Profile(
            /**
             * 성별 (MALE / FEMALE / OTHER)
             */
            @NotNull Gender gender,

            /**
             * 나이. 예: 12, 25, 67 ...
             * 0보다 커야 한다고 가정.
             */
            @NotNull
            @Min(value = 0, message = "나이는 0 이상이어야 합니다.")
            @Max(value = 130, message = "나이가 비정상적으로 큽니다.")
            Integer age,

            /**
             * 지역 - 도 단위 (예: "서울특별시")
             */
            @NotBlank @Size(max = 30)
            String regionDo,

            /**
             * 지역 - 시/구 단위 (예: "종로구")
             */
            @NotBlank @Size(max = 30)
            String regionSi
    ) {}
}
