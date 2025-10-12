package com.benefitmap.backend.onboarding.dto;

import com.benefitmap.backend.user.enums.Gender;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

/**
 * 온보딩 요청 DTO
 * - 회원가입 후 추가정보 입력(온보딩) 시 클라이언트에서 전달되는 데이터 구조
 * - 내부적으로 Profile 정보 + 선택된 태그 코드 목록을 포함한다.
 */
public record OnboardingRequest(

        /** 생애주기 태그 코드 목록
         *  - 최소 1개 이상 선택해야 함
         */
        @Size(min = 1, message = "생애주기 태그는 최소 1개 이상 선택하세요.")
        List<@NotBlank String> lifecycleCodes,

        /** 가구상황 태그 코드 목록
         *  - 최소 1개 이상 선택해야 함
         */
        @Size(min = 1, message = "가구상황 태그는 최소 1개 이상 선택하세요.")
        List<@NotBlank String> householdCodes,

        /** 관심주제 태그 코드 목록
         *  - 선택 사항(0개 이상 가능)
         */
        @Size(min = 0)
        List<@NotBlank String> interestCodes,

        /** 유저 프로필 정보
         *  - 성별, 생년월일, 지역 정보 포함
         */
        @NotNull Profile profile
) {

    /**
     * 프로필 정보 서브 레코드
     * - 성별, 생년월일, 지역(도/시)을 포함
     */
    public record Profile(
            /** 성별 (MALE / FEMALE) */
            @NotNull Gender gender,

            /** 생년월일
             *  - 반드시 과거 날짜여야 함
             */
            @NotNull @Past LocalDate birthDate,

            /** 지역 - 도 단위
             *  - 공백 불가, 최대 30자
             */
            @NotBlank @Size(max = 30) String regionDo,

            /** 지역 - 시 단위
             *  - 공백 불가, 최대 30자
             */
            @NotBlank @Size(max = 30) String regionSi
    ) {}
}
