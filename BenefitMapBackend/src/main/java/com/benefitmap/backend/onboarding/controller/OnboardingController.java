package com.benefitmap.backend.onboarding.controller;

import com.benefitmap.backend.onboarding.OnboardingService;
import com.benefitmap.backend.onboarding.TagQueryService;
import com.benefitmap.backend.onboarding.dto.OnboardingRequest;
import com.benefitmap.backend.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

// Swagger/OpenAPI
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "온보딩 및 태그 조회 API")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final TagQueryService tagQueryService;

    /** 생애주기 태그 조회 */
    @GetMapping("/tags/lifecycle")
    @Operation(
            summary = "라이프사이클 태그 목록",
            description = "온보딩 화면에서 사용하는 라이프사이클(lifecycle) 태그를 반환합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(
                                            name = "ok",
                                            value = """
                                            {
                                              "success": true,
                                              "message": null,
                                              "data": [
                                                {"code":"PREGNANCY_BIRTH","nameKo":"임신·출산","displayOrder":1,"active":true},
                                                {"code":"YOUTH","nameKo":"청년","displayOrder":5,"active":true}
                                              ],
                                              "timestamp": "2025-09-24T13:31:40.436095Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    public ApiResponse<?> lifecycle() {
        return ApiResponse.ok(tagQueryService.findLifecycle());
    }

    /** 가구상황 태그 조회 */
    @GetMapping("/tags/household")
    @Operation(
            summary = "가구상황 태그 목록",
            description = "온보딩 화면에서 사용하는 가구상황(household) 태그를 반환합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(
                                            name = "ok",
                                            value = """
                                            {
                                              "success": true,
                                              "message": null,
                                              "data": [
                                                {"code":"LOW_INCOME","nameKo":"저소득","displayOrder":1,"active":true},
                                                {"code":"DISABLED","nameKo":"장애인","displayOrder":2,"active":true}
                                              ],
                                              "timestamp": "2025-09-24T13:31:40.436095Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    public ApiResponse<?> household() {
        return ApiResponse.ok(tagQueryService.findHousehold());
    }

    /** 관심주제 태그 조회 */
    @GetMapping("/tags/interest")
    @Operation(
            summary = "관심주제 태그 목록",
            description = "온보딩 화면에서 사용하는 관심주제(interest) 태그를 반환합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(
                                            name = "ok",
                                            value = """
                                            {
                                              "success": true,
                                              "message": null,
                                              "data": [
                                                {"code":"JOBS","nameKo":"일자리","displayOrder":5,"active":true},
                                                {"code":"HOUSING","nameKo":"주거","displayOrder":4,"active":true}
                                              ],
                                              "timestamp": "2025-09-24T13:31:40.436095Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    public ApiResponse<?> interest() {
        return ApiResponse.ok(tagQueryService.findInterest());
    }

    /** 사용자 온보딩 정보 조회 */
    @GetMapping("/onboarding")
    @Operation(
            summary = "사용자 온보딩 정보 조회",
            description = """
                현재 로그인한 사용자의 온보딩 정보(프로필, 선택된 태그들)를 반환합니다.

                profile 안에는:
                - gender (성별)
                - age (나이)
                - regionDo / regionSi (지역)

                그리고 lifecycleTags / householdTags / interestTags 는
                사용자가 현재 선택 중인 태그의 상세 정보(code, nameKo 등)를 포함합니다.
                """,
            security = {
                    @SecurityRequirement(name = "bearerAuth"),
                    @SecurityRequirement(name = "cookieAuth")
            },
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(
                                            name = "success",
                                            value = """
                                            {
                                              "success": true,
                                              "message": null,
                                              "data": {
                                                "profile": {
                                                  "gender": "MALE",
                                                  "age": 12,
                                                  "regionDo": "서울특별시",
                                                  "regionSi": "종로구"
                                                },
                                                "lifecycleTags": [
                                                  {"code":"TEEN","nameKo":"청소년","displayOrder":4,"active":true}
                                                ],
                                                "householdTags": [
                                                  {"code":"NONE","nameKo":"해당사항 없음","displayOrder":7,"active":true}
                                                ],
                                                "interestTags": [
                                                  {"code":"JOBS","nameKo":"일자리","displayOrder":5,"active":true},
                                                  {"code":"HOUSING","nameKo":"주거","displayOrder":4,"active":true}
                                                ]
                                              },
                                              "timestamp": "2025-09-24T13:31:40.436095Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "401",
                            description = "미인증(로그인 필요)",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(
                                            name = "unauthorized",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "Login required",
                                              "data": null,
                                              "timestamp": "2025-09-24T13:31:40.436095Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "404",
                            description = "온보딩 정보 없음",
                            content = @Content(
                                    mediaType = "application/json",
                                    examples = @ExampleObject(
                                            name = "not-found",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "Onboarding information not found",
                                              "data": null,
                                              "timestamp": "2025-09-24T13:31:40.436095Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    public ApiResponse<?> getOnboardingInfo(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        var result = onboardingService.getOnboardingInfo(userId);
        return ApiResponse.ok(result);
    }

    /** 온보딩 완료 저장 */
    @PostMapping("/onboarding")
    @Operation(
            summary = "온보딩 완료 저장",
            description = """
                사용자가 온보딩 화면에서 입력한 정보(성별, 나이, 거주 지역, 태그 선택)를 저장하고
                그 유저를 ACTIVE 상태로 전환합니다.

                요청 형식 예시:
                {
                  "profile": {
                    "gender": "MALE",
                    "age": 12,
                    "regionDo": "서울특별시",
                    "regionSi": "종로구"
                  },
                  "lifecycleCodes": ["TEEN"],
                  "householdCodes": ["NONE"],
                  "interestCodes": ["JOBS","HOUSING"]
                }
                """,
            security = {
                    @SecurityRequirement(name = "bearerAuth"),
                    @SecurityRequirement(name = "cookieAuth")
            },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingRequest.class),
                            examples = @ExampleObject(
                                    name = "sample",
                                    value = """
                                    {
                                      "profile": {
                                        "gender": "MALE",
                                        "age": 12,
                                        "regionDo": "서울특별시",
                                        "regionSi": "종로구"
                                      },
                                      "lifecycleCodes": ["TEEN"],
                                      "householdCodes": ["NONE"],
                                      "interestCodes": ["JOBS","HOUSING"]
                                    }
                                    """
                            )
                    )
            )
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "저장 성공",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "success",
                                    value = """
                                    {
                                      "success": true,
                                      "message": "onboarding completed",
                                      "data": { "role":"ROLE_USER", "status":"ACTIVE" },
                                      "timestamp": "2025-09-24T13:31:40.436095Z"
                                    }
                                    """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "검증 실패(누락/형식 오류)",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "bad-request",
                                    value = """
                                    {
                                      "success": false,
                                      "message": "Validation failed: lifecycleCodes must not be empty",
                                      "data": null,
                                      "timestamp": "2025-09-24T13:31:40.436095Z"
                                    }
                                    """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "미인증(로그인 필요)",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "unauthorized",
                                    value = """
                                    {
                                      "success": false,
                                      "message": "Login required",
                                      "data": null,
                                      "timestamp": "2025-09-24T13:31:40.436095Z"
                                    }
                                    """
                            )
                    )
            )
    })
    public ApiResponse<?> save(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody OnboardingRequest req
    ) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        onboardingService.save(userId, req);

        return ApiResponse.ok(
                "onboarding completed",
                Map.of(
                        "role", "ROLE_USER",
                        "status", "ACTIVE"
                )
        );
    }
}
