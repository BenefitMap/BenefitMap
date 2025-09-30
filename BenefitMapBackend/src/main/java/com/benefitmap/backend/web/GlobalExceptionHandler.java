package com.benefitmap.backend.web;

import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
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
 * 전역 예외 처리기 (우리 컨트롤러에만 적용)
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.benefitmap.backend")
public class GlobalExceptionHandler {

    private static String rootMsg(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null) t = t.getCause();
        return t.getClass().getSimpleName() + ": " + (t.getMessage() == null ? "" : t.getMessage());
    }

    /** 컨트롤러에서 명시적으로 상태코드를 지정한 경우(예: new ResponseStatusException(401, "Login required")) */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleRse(ResponseStatusException e) {
        var status = HttpStatus.resolve(e.getStatusCode().value());
        String msg = e.getReason() != null ? e.getReason() : (status != null ? status.getReasonPhrase() : "error");
        log.warn("{} {}", e.getStatusCode(), msg);
        return ResponseEntity.status(e.getStatusCode()).body(ApiResponse.fail(msg));
    }

    /** 잘못된 요청(비즈니스 유효성 실패 포함) */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> illegalArg(IllegalArgumentException e) {
        log.warn("400 IllegalArgument: {}", rootMsg(e), e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(e.getMessage() != null ? e.getMessage() : "bad request"));
    }

    /** @Valid 검증 실패 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException e) {
        log.warn("400 Validation: {}", rootMsg(e));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("validation error"));
    }

    /** JSON 파싱 실패 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> notReadable(HttpMessageNotReadableException e) {
        log.warn("400 NotReadable: {}", rootMsg(e));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("malformed request"));
    }

    /** 중복키/무결성 오류 */
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

    /** 인증 토큰 문제 */
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

    /** 나머지 → 500 (원인 로그 남김) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> unknown(Exception e) {
        log.error("500 Internal: {}", rootMsg(e), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("internal server error"));
    }
}
