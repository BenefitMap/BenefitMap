package com.benefitmap.backend.web;

import com.benefitmap.backend.common.api.ApiResponse;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * 전역 예외 처리기 (컨트롤러 공통 응답 형식 유지)
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.benefitmap.backend")
public class GlobalExceptionHandler {

    /** 가장 안쪽 원인 메시지 */
    private static String rootMsg(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null) t = t.getCause();
        return t.getClass().getSimpleName() + ": " + (t.getMessage() == null ? "" : t.getMessage());
    }

    /** 컨트롤러에서 명시한 상태코드 전달 */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleRse(ResponseStatusException e) {
        var status = HttpStatus.resolve(e.getStatusCode().value());
        String msg = e.getReason() != null ? e.getReason()
                : (status != null ? status.getReasonPhrase() : "error");
        log.warn("{} {}", e.getStatusCode(), msg);
        return ResponseEntity.status(e.getStatusCode()).body(ApiResponse.fail(msg));
    }

    /** 잘못된 요청(비즈니스 유효성 포함) */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> illegalArg(IllegalArgumentException e) {
        log.warn("400 IllegalArgument: {}", rootMsg(e), e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "bad request"));
    }

    /** @Valid 검증 실패 (RequestBody DTO 등) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException e) {
        // 커스텀 Constraint 메시지 포함, 첫 에러 메시지만 노출
        String msg = e.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("validation error");

        log.warn("400 Validation: {}", msg);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(msg));
    }

    /** @Validated 파라미터/경로변수 검증 실패 (Controller 메서드 파라미터) */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> constraint(ConstraintViolationException e) {
        String msg = e.getConstraintViolations().stream()
                .findFirst()
                .map(v -> v.getMessage())
                .orElse("validation error");
        log.warn("400 ConstraintViolation: {}", msg);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(msg));
    }

    /** JSON 파싱 실패 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> notReadable(HttpMessageNotReadableException e) {
        log.warn("400 NotReadable: {}", rootMsg(e));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("malformed request"));
    }

    /** 중복키/무결성 위반 */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> dataIntegrity(DataIntegrityViolationException e) {
        log.warn("409 DataIntegrity: {}", rootMsg(e), e);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.fail("data conflict"));
    }

    /** 엔티티 없음 */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> notFound(EntityNotFoundException e) {
        log.warn("404 NotFound: {}", rootMsg(e));
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.fail("not found"));
    }

    /** JWT 오류(서명/만료 등) */
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<Void>> jwt(JwtException e) {
        log.warn("401 JWT: {}", rootMsg(e));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail("invalid token"));
    }

    /** 권한 부족 */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> accessDenied(AccessDeniedException e) {
        log.warn("403 Forbidden: {}", rootMsg(e));
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.fail("forbidden"));
    }

    /** 기타 예외 → 500 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> unknown(Exception e) {
        log.error("500 Internal: {}", rootMsg(e), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("internal server error"));
    }
}
