package com.benefitmap.backend.catalog.controller;

import com.benefitmap.backend.catalog.CatalogDataLoader;
import com.benefitmap.backend.common.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@Profile("dev")
@RestController
@RequestMapping("/api/catalog/_debug")
@RequiredArgsConstructor
public class CatalogDebugController {
    private final CatalogDataLoader loader;

    @GetMapping("/count")
    public ApiResponse<Integer> count() {
        return ApiResponse.ok(loader.getItems() == null ? 0 : loader.getItems().size());
    }
}
