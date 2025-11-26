package com.benefitmap.backend.catalog.service;

import com.benefitmap.backend.catalog.CatalogDataLoader;
import com.benefitmap.backend.catalog.dto.CatalogSearchRequest;
import com.benefitmap.backend.catalog.dto.WelfareItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 카탈로그 검색 서비스
 * - 로드된 복지 항목 목록을 조건에 따라 필터링
 * - 키워드(부분 일치, 대소문자 무시)와 태그 OR 매칭 지원
 * - households에 NONE 포함 시 단독만 허용
 */
@Service
@RequiredArgsConstructor
public class CatalogSearchService {

    private final CatalogDataLoader loader;

    /**
     * 카탈로그 검색
     * @param req 검색 조건
     * @return 조건에 맞는 항목 리스트
     * @throws ResponseStatusException households 규칙 위반 시 400
     */
    public List<WelfareItemDto> search(CatalogSearchRequest req) {
        // 1) households 검증: NONE은 단독만 허용
        if (req.households() != null) {
            List<String> hs = req.households();
            boolean containsNone = hs.stream().anyMatch(s -> "NONE".equalsIgnoreCase(s));
            if (containsNone && hs.size() > 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "households: NONE must be alone");
            }
        }

        // 2) 전체 데이터 조회
        List<WelfareItemDto> all = loader.getItems();
        if (all == null || all.isEmpty()) return List.of();

        // 3) 필터 존재 여부 확인
        boolean noKeyword   = req.keyword() == null || req.keyword().isBlank();
        boolean noLifecycle = req.lifecycles() == null || req.lifecycles().isEmpty();
        boolean noHouse     = req.households() == null || req.households().isEmpty();
        boolean noInterest  = req.interests() == null || req.interests().isEmpty();

        // 필터 없으면 전체 반환
        if (noKeyword && noLifecycle && noHouse && noInterest) {
            return all;
        }

        // 4) 키워드 정규화(소문자)
        String kw = noKeyword ? null : req.keyword().toLowerCase(Locale.ROOT);

        // 5) 태그 정규화(대문자 Set)
        Set<String> lcSet = noLifecycle
                ? Collections.emptySet()
                : req.lifecycles().stream().map(String::toUpperCase).collect(Collectors.toSet());
        Set<String> hhSet = noHouse
                ? Collections.emptySet()
                : req.households().stream().map(String::toUpperCase).collect(Collectors.toSet());
        Set<String> itSet = noInterest
                ? Collections.emptySet()
                : req.interests().stream().map(String::toUpperCase).collect(Collectors.toSet());

        // 6) 조건 필터링
        return all.stream().filter(item -> {
            // 6-1) 키워드: 복지명/설명/부처 중 하나라도 부분 일치
            if (kw != null) {
                String hay = (item.welfareName() + " " + item.description() + " " + item.department())
                        .toLowerCase(Locale.ROOT);
                if (!hay.contains(kw)) return false;
            }

            // 6-2) 생애주기 태그: 교집합 1개 이상
            if (!lcSet.isEmpty()) {
                boolean match = item.lifecycles().stream()
                        .map(String::toUpperCase)
                        .anyMatch(lcSet::contains);
                if (!match) return false;
            }

            // 6-3) 가구상황 태그: 교집합 1개 이상
            if (!hhSet.isEmpty()) {
                boolean match = item.households().stream()
                        .map(String::toUpperCase)
                        .anyMatch(hhSet::contains);
                if (!match) return false;
            }

            // 6-4) 관심주제 태그: 교집합 1개 이상
            if (!itSet.isEmpty()) {
                boolean match = item.interests().stream()
                        .map(String::toUpperCase)
                        .anyMatch(itSet::contains);
                if (!match) return false;
            }

            return true;
        }).toList();
    }
}
