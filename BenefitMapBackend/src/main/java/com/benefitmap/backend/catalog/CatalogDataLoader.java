package com.benefitmap.backend.catalog;

import com.benefitmap.backend.catalog.dto.WelfareItemDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;

/**
 * 카탈로그 데이터 로더
 * - 애플리케이션 시작 시 welfare_dummy.json 파일을 읽어 복지 데이터를 메모리에 적재
 * - 로드 실패 시 빈 리스트로 초기화
 * - 로드 결과를 로그로 출력
 */
@Slf4j
@Component
public class CatalogDataLoader {

    private final ObjectMapper om = new ObjectMapper();

    /** 로드된 복지 항목 리스트 */
    @Getter
    private List<WelfareItemDto> items = Collections.emptyList();

    /**
     * 애플리케이션 시작 시 JSON 파일을 읽어 데이터 적재
     * - 파일 경로: classpath:catalog/welfare_dummy.json
     * - 실패 시 빈 리스트로 대체
     */
    @PostConstruct
    void load() {
        try {
            // 1) 리소스 파일 로드
            ClassPathResource res = new ClassPathResource("catalog/welfare_dummy.json");

            // 2) JSON → 객체 변환
            try (InputStream in = res.getInputStream()) {
                items = om.readValue(in, new TypeReference<List<WelfareItemDto>>() {});
            }

            // 3) 로드 성공 로그
            log.info("[CatalogDataLoader] loaded {} items from {}", items.size(), res.getPath());

        } catch (Exception e) {
            // 4) 실패 시 빈 리스트 유지
            log.error("[CatalogDataLoader] load failed: {}", e.getMessage(), e);
            items = Collections.emptyList();
        }
    }
}
