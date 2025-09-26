package com.benefitmap.backend.web;

import com.benefitmap.backend.onboarding.OnboardingService;
import com.benefitmap.backend.onboarding.TagQueryService;
import com.benefitmap.backend.onboarding.dto.OnboardingRequest;
import com.benefitmap.backend.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final TagQueryService tagQueryService;

    @GetMapping("/tags/lifecycle")
    public ApiResponse<?> lifecycle() { return ApiResponse.ok(tagQueryService.findLifecycle()); }

    @GetMapping("/tags/household")
    public ApiResponse<?> household() { return ApiResponse.ok(tagQueryService.findHousehold()); }

    @GetMapping("/tags/interest")
    public ApiResponse<?> interest() { return ApiResponse.ok(tagQueryService.findInterest()); }

    @PostMapping("/onboarding")
    public ApiResponse<?> save(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody OnboardingRequest req
    ) {
        onboardingService.save(userId, req);
        return ApiResponse.ok("onboarding completed", Map.of("role","ROLE_USER","status","ACTIVE"));
    }
}
