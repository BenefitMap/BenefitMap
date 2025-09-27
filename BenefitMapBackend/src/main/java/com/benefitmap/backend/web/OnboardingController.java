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

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

// ==== Swagger ====
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
// ⚠️ 주의: Java는 import 별칭을 지원하지 않음 → Swagger ApiResponse/ApiResponses는 FQN으로 사용

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "온보딩 및 태그 조회 API")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final TagQueryService tagQueryService;

    @GetMapping("/tags/lifecycle")
    @Operation(
            summary = "라이프사이클 태그 목록",
            description = "온보딩 화면에서 사용하는 라이프사이클(lifecycle) 태그를 반환합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(mediaType = "application/json",
                                    examples = @ExampleObject(name = "ok", value = """
                    {
                      "success": true,
                      "message": null,
                      "data": [
                        {"code":"PREGNANCY_BIRTH","nameKo":"임신·출산","displayOrder":1,"active":true},
                        {"code":"YOUTH","nameKo":"청년","displayOrder":5,"active":true}
                      ],
                      "timestamp": "2025-09-24T13:31:40.436095Z"
                    }
                    """)))
            }
    )
    public ApiResponse<?> lifecycle() { return ApiResponse.ok(tagQueryService.findLifecycle()); }

    @GetMapping("/tags/household")
    @Operation(
            summary = "가구(세대) 태그 목록",
            description = "온보딩 화면에서 사용하는 가구/세대(household) 태그를 반환합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(mediaType = "application/json",
                                    examples = @ExampleObject(name = "ok", value = """
                    {
                      "success": true,
                      "message": null,
                      "data": [
                        {"code":"LOW_INCOME","nameKo":"저소득","displayOrder":1,"active":true},
                        {"code":"DISABLED","nameKo":"장애인","displayOrder":2,"active":true}
                      ],
                      "timestamp": "2025-09-24T13:31:40.436095Z"
                    }
                    """)))
            }
    )
    public ApiResponse<?> household() { return ApiResponse.ok(tagQueryService.findHousehold()); }

    @GetMapping("/tags/interest")
    @Operation(
            summary = "관심사 태그 목록",
            description = "온보딩 화면에서 사용하는 관심사(interest) 태그를 반환합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(mediaType = "application/json",
                                    examples = @ExampleObject(name = "ok", value = """
                    {
                      "success": true,
                      "message": null,
                      "data": [
                        {"code":"JOBS","nameKo":"일자리","displayOrder":5,"active":true},
                        {"code":"HOUSING","nameKo":"주거","displayOrder":4,"active":true}
                      ],
                      "timestamp": "2025-09-24T13:31:40.436095Z"
                    }
                    """)))
            }
    )
    public ApiResponse<?> interest() { return ApiResponse.ok(tagQueryService.findInterest()); }

    @PostMapping("/onboarding")
    @Operation(
            summary = "온보딩 완료 저장",
            description = "사용자의 프로필/태그 선택 결과를 저장하고, 이후 권한/상태 전환 등에 사용됩니다.",
            security = { @SecurityRequirement(name = "bearerAuth"), @SecurityRequirement(name = "cookieAuth") },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingRequest.class),
                            examples = @ExampleObject(name = "sample", value = """
                {
                  "profile": {
                    "gender": "MALE",
                    "birthDate": "1995-02-03",
                    "regionDo": "경기도",
                    "regionSi": "수원시"
                  },
                  "lifecycleCodes": ["YOUTH"],
                  "householdCodes": ["LOW_INCOME"],
                  "interestCodes": ["JOBS","HOUSING"]
                }
                """)))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "저장 성공",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "success", value = """
                {
                  "success": true,
                  "message": "onboarding completed",
                  "data": { "role":"ROLE_USER", "status":"ACTIVE" },
                  "timestamp": "2025-09-24T13:31:40.436095Z"
                }
                """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "검증 실패(누락/형식 오류)",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "bad-request", value = """
                {
                  "success": false,
                  "message": "Validation failed: lifecycleCodes must not be empty",
                  "data": null,
                  "timestamp": "2025-09-24T13:31:40.436095Z"
                }
                """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "미인증(로그인 필요)",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(name = "unauthorized", value = """
                {
                  "success": false,
                  "message": "Login required",
                  "data": null,
                  "timestamp": "2025-09-24T13:31:40.436095Z"
                }
                """)))
    })
    public ApiResponse<?> save(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody OnboardingRequest req
    ) {
        // 미인증 시 500이 아닌 401로 응답 (Swagger 디버깅 편의)
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        onboardingService.save(userId, req);
        return ApiResponse.ok("onboarding completed", Map.of("role","ROLE_USER","status","ACTIVE"));
    }
}
 