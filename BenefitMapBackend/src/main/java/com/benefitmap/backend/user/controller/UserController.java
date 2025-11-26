package com.benefitmap.backend.user.controller;

import com.benefitmap.backend.auth.token.RefreshTokenRepository;
import com.benefitmap.backend.common.api.ApiResponse;
import com.benefitmap.backend.tag.entity.UserHouseholdTag;
import com.benefitmap.backend.tag.entity.UserHouseholdTagId;
import com.benefitmap.backend.tag.entity.UserInterestTag;
import com.benefitmap.backend.tag.entity.UserInterestTagId;
import com.benefitmap.backend.tag.entity.UserLifecycleTag;
import com.benefitmap.backend.tag.entity.UserLifecycleTagId;
import com.benefitmap.backend.tag.repo.UserHouseholdTagRepository;
import com.benefitmap.backend.tag.repo.UserInterestTagRepository;
import com.benefitmap.backend.tag.repo.UserLifecycleTagRepository;
import com.benefitmap.backend.user.dto.MyPageResponse;
import com.benefitmap.backend.user.dto.UpdateMyPageRequest;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.entity.UserProfile;
import com.benefitmap.backend.user.enums.Gender;
import com.benefitmap.backend.user.repo.UserProfileRepository;
import com.benefitmap.backend.user.repo.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/user")
@Tag(
        name = "User",
        description = """
            사용자 계정 / 프로필 API

            - GET    /user/me : 내 정보 조회
            - PATCH  /user/me : 내 정보 수정 (이름/이메일/프로필사진 제외)
            - DELETE /user/me : 회원 탈퇴 + 토큰 폐기 + 쿠키 만료
            """
)
public class UserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private final UserLifecycleTagRepository userLifecycleTagRepository;
    private final UserHouseholdTagRepository userHouseholdTagRepository;
    private final UserInterestTagRepository userInterestTagRepository;

    /** HTTPS라면 true → Secure 쿠키 + SameSite=None */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    public UserController(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            RefreshTokenRepository refreshTokenRepository,
            UserLifecycleTagRepository userLifecycleTagRepository,
            UserHouseholdTagRepository userHouseholdTagRepository,
            UserInterestTagRepository userInterestTagRepository
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userLifecycleTagRepository = userLifecycleTagRepository;
        this.userHouseholdTagRepository = userHouseholdTagRepository;
        this.userInterestTagRepository = userInterestTagRepository;
    }

    /* =========================================================
     *  GET /user/me : 내 정보 조회
     * ========================================================= */
    @Operation(
            summary = "내 정보 조회",
            description = """
                로그인한 사용자의 기본정보/프로필/태그 정보를 조회합니다.

                응답에는 다음이 포함됩니다:
                - name / email / imageUrl (Google에서 온 값, 수정 불가)
                - gender / age / regionDo / regionSi (수정 가능)
                - lifecycleCodes / householdCodes / interestCodes (사용자 태그 코드 목록)
                """,
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "UserProfileSuccess",
                                            value = """
                                            {
                                              "success": true,
                                              "message": "사용자 정보 조회 성공",
                                              "data": {
                                                "userId": 42,
                                                "basic": {
                                                  "name": "송유현",
                                                  "email": "songyhyh00@gmail.com",
                                                  "imageUrl": "https://lh3.googleusercontent.com/a/...",
                                                  "gender": "MALE",
                                                  "age": 12
                                                },
                                                "profile": {
                                                  "regionDo": "서울특별시",
                                                  "regionSi": "종로구"
                                                },
                                                "tags": {
                                                  "lifecycleCodes": ["TEEN"],
                                                  "householdCodes": ["NONE"],
                                                  "interestCodes": ["MENTAL_HEALTH", "JOBS"]
                                                }
                                              },
                                              "timestamp": "2025-10-25T12:34:56.789Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "401",
                            description = "인증 실패 (쿠키나 세션 없음)",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "Unauthorized",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "인증되지 않은 사용자입니다.",
                                              "data": null,
                                              "timestamp": "2025-10-25T12:34:56.789Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "404",
                            description = "유저 또는 프로필 없음",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "ProfileNotFound",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "프로필을 찾을 수 없습니다.",
                                              "data": null,
                                              "timestamp": "2025-10-25T12:34:56.789Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MyPageResponse>> getMe() {
        Long userId = currentUserId();
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.fail("인증되지 않은 사용자입니다."));
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.fail("사용자를 찾을 수 없습니다."));
        }

        UserProfile profile = userProfileRepository.findById(userId).orElse(null);
        if (profile == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.fail("프로필을 찾을 수 없습니다."));
        }

        List<String> lifecycleCodes = userLifecycleTagRepository.findCodesByUserId(userId);
        List<String> householdCodes = userHouseholdTagRepository.findCodesByUserId(userId);
        List<String> interestCodes  = userInterestTagRepository.findCodesByUserId(userId);

        MyPageResponse dto = new MyPageResponse(
                user.getId(),
                new MyPageResponse.BasicInfo(
                        user.getName(),
                        user.getEmail(),
                        user.getImageUrl(),
                        profile.getGender() != null ? profile.getGender().name() : null,
                        profile.getAge() != null ? profile.getAge().intValue() : null
                ),
                new MyPageResponse.ProfileInfo(
                        profile.getRegionDo(),
                        profile.getRegionSi()
                ),
                new MyPageResponse.TagInfo(
                        lifecycleCodes,
                        householdCodes,
                        interestCodes
                )
        );

        return ResponseEntity.ok(ApiResponse.ok("사용자 정보 조회 성공", dto));
    }


    /* =========================================================
     *  PATCH /user/me : 내 정보 수정
     * ========================================================= */
    @Operation(
            summary = "내 정보 수정",
            description = """
                로그인한 사용자의 프로필 정보를 수정합니다.

                변경 가능한 항목:
                - gender (성별)
                - age (나이)
                - regionDo / regionSi (지역)
                - lifecycleTagIds / householdTagIds / interestTagIds (선택한 태그들)

                변경 불가능:
                - name / email / imageUrl (Google에서 받아온 값은 고정)

                처리 흐름:
                1) user_profile 갱신 (gender/age/region)
                2) user_*_tag 매핑 전부 삭제 후 새로 삽입
                3) 최종 상태를 다시 조회해서 반환
                """,
            security = @SecurityRequirement(name = "cookieAuth"),
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "사용자 프로필 수정 요청",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UpdateMyPageRequest.class),
                            examples = @ExampleObject(
                                    name = "UpdateMyPageRequestExample",
                                    value = """
                                    {
                                      "gender": "MALE",
                                      "age": 12,
                                      "regionDo": "서울특별시",
                                      "regionSi": "종로구",
                                      "lifecycleTagIds": [4],
                                      "householdTagIds": [7],
                                      "interestTagIds": [2, 5]
                                    }
                                    """
                            )
                    )
            ),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "수정 성공. (수정된 최신 상태를 그대로 반환)",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "UpdateSuccess",
                                            value = """
                                            {
                                              "success": true,
                                              "message": "사용자 정보 조회 성공",
                                              "data": {
                                                "userId": 42,
                                                "basic": {
                                                  "name": "송유현",
                                                  "email": "songyhyh00@gmail.com",
                                                  "imageUrl": "https://lh3.googleusercontent.com/a/...",
                                                  "gender": "MALE",
                                                  "age": 12
                                                },
                                                "profile": {
                                                  "regionDo": "서울특별시",
                                                  "regionSi": "종로구"
                                                },
                                                "tags": {
                                                  "lifecycleCodes": ["TEEN"],
                                                  "householdCodes": ["NONE"],
                                                  "interestCodes": ["MENTAL_HEALTH", "JOBS"]
                                                }
                                              },
                                              "timestamp": "2025-10-25T12:34:56.789Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "401",
                            description = "인증 실패 (쿠키/세션 없음)",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "Unauthorized",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "인증되지 않은 사용자입니다.",
                                              "data": null,
                                              "timestamp": "2025-10-25T12:34:56.789Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "404",
                            description = "해당 유저 또는 프로필이 DB에 존재하지 않음",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "ProfileNotFound",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "프로필을 찾을 수 없습니다.",
                                              "data": null,
                                              "timestamp": "2025-10-25T12:34:56.789Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    @PatchMapping("/me")
    @Transactional
    public ResponseEntity<ApiResponse<MyPageResponse>> updateMe(
            @RequestBody UpdateMyPageRequest req
    ) {
        Long userId = currentUserId();
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.fail("인증되지 않은 사용자입니다."));
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.fail("사용자를 찾을 수 없습니다."));
        }

        UserProfile profile = userProfileRepository.findById(userId).orElse(null);
        if (profile == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.fail("프로필을 찾을 수 없습니다."));
        }

        // 기본 프로필 갱신
        if (req.gender() != null) {
            profile.setGender(Gender.valueOf(req.gender()));
        }
        if (req.age() != null) {
            profile.setAge(req.age().shortValue()); // age는 SMALLINT(Short)로 저장
        }
        if (req.regionDo() != null) {
            profile.setRegionDo(req.regionDo());
        }
        if (req.regionSi() != null) {
            profile.setRegionSi(req.regionSi());
        }
        userProfileRepository.save(profile);

        // 태그 매핑 재설정
        userLifecycleTagRepository.deleteByIdUserId(userId);
        if (req.lifecycleTagIds() != null) {
            for (Short tagId : req.lifecycleTagIds()) {
                userLifecycleTagRepository.save(
                        UserLifecycleTag.builder()
                                .id(new UserLifecycleTagId(userId, tagId))
                                .build()
                );
            }
        }

        userHouseholdTagRepository.deleteByIdUserId(userId);
        if (req.householdTagIds() != null) {
            for (Short tagId : req.householdTagIds()) {
                userHouseholdTagRepository.save(
                        UserHouseholdTag.builder()
                                .id(new UserHouseholdTagId(userId, tagId))
                                .build()
                );
            }
        }

        userInterestTagRepository.deleteByIdUserId(userId);
        if (req.interestTagIds() != null) {
            for (Short tagId : req.interestTagIds()) {
                userInterestTagRepository.save(
                        UserInterestTag.builder()
                                .id(new UserInterestTagId(userId, tagId))
                                .build()
                );
            }
        }

        // 수정 후 최신 상태 그대로 반환
        return getMe();
    }


    /* =========================================================
     *  DELETE /user/me : 회원 탈퇴
     * ========================================================= */
    @Operation(
            summary = "회원 탈퇴",
            description = """
                로그인한 사용자의 계정을 삭제합니다.
                - DB에서 user / user_profile / 태그 매핑 등 사용자 관련 데이터가 삭제됩니다 (FK cascade 기준)
                - refresh_token 테이블의 해당 유저 토큰을 모두 삭제합니다
                - ACCESS_TOKEN / REFRESH_TOKEN 쿠키를 즉시 만료 상태로 내려서 클라이언트 세션을 끊습니다.
                """,
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "회원탈퇴 성공 or 인증 안 된 상태에서의 쿠키 정리 완료",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = {
                                            @ExampleObject(
                                                    name = "DeleteSuccess",
                                                    value = """
                                                    {
                                                      "success": true,
                                                      "message": "deleted",
                                                      "data": null,
                                                      "timestamp": "2025-10-25T12:34:56.789Z"
                                                    }
                                                    """
                                            ),
                                            @ExampleObject(
                                                    name = "NoAuthJustClearedCookies",
                                                    value = """
                                                    {
                                                      "success": true,
                                                      "message": "no auth, just cleared cookies",
                                                      "data": null,
                                                      "timestamp": "2025-10-25T12:34:56.789Z"
                                                    }
                                                    """
                                            )
                                    }
                            )
                    )
            }
    )
    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteMe() {
        Long userId = currentUserId();
        if (userId == null)
            return okWithExpiredCookies("no auth, just cleared cookies");

        try { refreshTokenRepository.deleteByUser_Id(userId); } catch (Exception ignored) {}
        try { userRepository.deleteById(userId); } catch (Exception ignored) {}

        return okWithExpiredCookies("deleted");
    }


    /* =========================================================
     *  내부 유틸
     * ========================================================= */

    /**
     * SecurityContextHolder에서 현재 로그인한 유저의 ID를 Long으로 뽑는다.
     * principal이 Number/String이든, getName()이든, getId() 리플렉션이든 최대한 시도.
     */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        Object principal = auth.getPrincipal();

        if (principal instanceof Number n) return n.longValue();
        if (principal instanceof String s) {
            try { return Long.parseLong(s); } catch (Exception ignored) {}
        }

        try { return Long.parseLong(auth.getName()); } catch (Exception ignored) {}

        try {
            var m = principal.getClass().getMethod("getId");
            Object v = m.invoke(principal);
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) return Long.parseLong(s);
        } catch (Exception ignored) {}

        return null;
    }

    /**
     * ACCESS_TOKEN / REFRESH_TOKEN 쿠키를 즉시 만료한 상태로 내려주면서
     * ApiResponse<Void>를 감싼 200 OK ResponseEntity를 만든다.
     */
    private ResponseEntity<ApiResponse<Void>> okWithExpiredCookies(String message) {
        String sameSite = cookieSecure ? "None" : "Lax";

        ResponseCookie expiredAccess = ResponseCookie.from("ACCESS_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        ResponseCookie expiredRefresh = ResponseCookie.from("REFRESH_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredAccess.toString())
                .header(HttpHeaders.SET_COOKIE, expiredRefresh.toString())
                .body(ApiResponse.ok(message, null));
    }
}
