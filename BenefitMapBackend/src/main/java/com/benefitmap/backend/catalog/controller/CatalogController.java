package com.benefitmap.backend.catalog.controller;

import com.benefitmap.backend.catalog.dto.CatalogSearchRequest;
import com.benefitmap.backend.catalog.dto.WelfareItemDto;
import com.benefitmap.backend.catalog.service.CatalogSearchService;
import com.benefitmap.backend.common.api.ApiResponse;
import com.benefitmap.backend.onboarding.TagQueryService;
import com.benefitmap.backend.user.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 복지 카탈로그 검색 API 컨트롤러
 * - /api/catalog/search : 키워드/생애주기/가구상황/관심사로 검색
 * - /api/catalog/recommend : 로그인 사용자의 온보딩 태그로 선필터 추천
 * - households에 "NONE" 포함 시 단독만 허용
 */
@Tag(name = "Catalog", description = "복지 카탈로그 검색/추천 API")
@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogSearchService catalogSearchService;
    private final TagQueryService tagQueryService;

    /**
     * 카탈로그 검색
     */
    @Operation(
            summary = "카탈로그 검색",
            description = "키워드/생애주기/가구상황/관심주제 조건으로 복지 항목을 검색합니다. "
                    + "households에 \"NONE\"이 포함되면 단독만 허용됩니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "검색 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(
                                    name = "SearchSuccess",
                                    value = """
                                            {
                                              "success": true,
                                              "message": "ok",
                                              "data": [
                                                {
                                                  "id": 91,
                                                  "welfareName": "복지이름91",
                                                  "description": "복지내용91",
                                                  "department": "담당부처A",
                                                  "supportCycle": "수시",
                                                  "supplyType": "현금지급",
                                                  "contact": "02-502-9196",
                                                  "url": "https://www.example.gov/service91",
                                                  "lifecycles": ["INFANT","CHILD","YOUTH"],
                                                  "households": ["NONE"],
                                                  "interests": ["CARE_PROTECT","MICRO_FINANCE","LIVING_SUPPORT"],
                                                  "startDate": "2025-10-10",
                                                  "endDate": "2025-10-18"
                                                }
                                              ],
                                              "timestamp": "2025-10-12T00:00:00Z"
                                            }
                                            """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "검증 실패(NONE 조합 오류 등)",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(
                                    name = "ValidationErrorNoneMixed",
                                    value = """
                                            {
                                              "success": false,
                                              "message": "households에 NONE은 단독으로만 선택할 수 있습니다.",
                                              "data": null,
                                              "timestamp": "2025-10-12T00:00:00Z"
                                            }
                                            """
                            )
                    )
            )
    })
    @PostMapping("/search")
    public ApiResponse<List<WelfareItemDto>> search(
            @RequestBody(
                    description = "검색 요청 바디",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CatalogSearchRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "ValidRequest",
                                            value = """
                                                    {
                                                      "keyword": "복지",
                                                      "lifecycles": ["YOUTH"],
                                                      "households": ["LOW_INCOME"],
                                                      "interests": ["HOUSING"]
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "InvalidHouseholdsWithNone",
                                            value = """
                                                    {
                                                      "lifecycles": ["SENIOR"],
                                                      "households": ["NONE", "LOW_INCOME"],
                                                      "interests": ["HEALTH"]
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @Valid @org.springframework.web.bind.annotation.RequestBody CatalogSearchRequest req
    ) {
        return ApiResponse.ok(catalogSearchService.search(req));
    }

    /**
     * 로그인 사용자의 온보딩 태그로 선필터하여 추천 목록 반환
     * - SecurityContext의 principal로 User를 받는 구조(JwtAuthenticationFilter에서 설정) 전제
     */
    @Operation(
            summary = "사용자 맞춤 추천",
            description = "로그인 사용자의 온보딩 태그(생애주기/가구상황/관심주제)로 먼저 필터링한 복지 목록을 반환합니다."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "추천 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(
                                    name = "RecommendSuccess",
                                    value = """
                                            {
                                              "success": true,
                                              "message": "ok",
                                              "data": [
                                                {
                                                  "id": 12,
                                                  "welfareName": "청년 주거 지원",
                                                  "description": "청년층의 주거비 부담을 완화하기 위한 월세 지원",
                                                  "department": "국토교통부",
                                                  "supportCycle": "수시",
                                                  "supplyType": "현금지급",
                                                  "contact": "02-111-2222",
                                                  "url": "https://www.example.gov/youth-housing",
                                                  "lifecycles": ["YOUTH"],
                                                  "households": ["LOW_INCOME"],
                                                  "interests": ["HOUSING"],
                                                  "startDate": "2025-10-05",
                                                  "endDate": "2025-10-20"
                                                }
                                              ],
                                              "timestamp": "2025-10-12T00:00:00Z"
                                            }
                                            """
                            )
                    )
            )
    })
    @GetMapping("/recommend")
    public ApiResponse<List<WelfareItemDto>> recommend() {
        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        // 사용자의 온보딩 태그 코드 조회
        var tags = tagQueryService.getUserTagCodes(user.getId());

        // households: NONE이 섞여 있으면 NONE 단독으로 정규화
        List<String> households = tags.households();
        if (households != null && households.size() > 1 &&
                households.stream().anyMatch(s -> "NONE".equalsIgnoreCase(s))) {
            households = List.of("NONE");
        }

        // 온보딩 태그를 검색 조건으로 구성
        var req = new CatalogSearchRequest(
                null,                 // keyword 없음
                tags.lifecycles(),    // 생애주기
                households,           // 가구상황
                tags.interests()      // 관심주제
        );

        return ApiResponse.ok(catalogSearchService.search(req));
    }
}
