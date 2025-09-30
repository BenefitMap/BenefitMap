package com.benefitmap.backend.onboarding.dto;

import com.benefitmap.backend.user.enums.Gender;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record OnboardingRequest(
        @NotNull Profile profile,
        @Size(min = 1, message = "생애주기 태그는 최소 1개 이상 선택하세요.")
        List<@NotBlank String> lifecycleCodes,
        @Size(min = 1, message = "가구/취약 태그는 최소 1개 이상 선택하세요.")
        List<@NotBlank String> householdCodes,
        @Size(min = 0) // 관심사는 선택
        List<@NotBlank String> interestCodes
) {
    public record Profile(
            @NotNull Gender gender,
            @NotNull @Past LocalDate birthDate,
            @NotBlank @Size(max = 30) String regionDo,
            @NotBlank @Size(max = 30) String regionSi
    ) {}
}
