package com.benefitmap.backend.config.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * OAuth2 인가 요청을 가로채서 구글로 갈 때 항상 prompt=select_account를 붙여준다.
 * 이렇게 해야 구글이 "방금 로그인했던 계정 그대로 쓸래?" 하고 자동 로그인시키지 않고,
 * 매번 계정 선택 화면(계정 고르는 팝업)을 띄워준다.
 */
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository,
                                              String authorizationRequestBaseUri) {
        // /oauth2/authorization/{registrationId} 처리하는 기본 리졸버
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository,
                authorizationRequestBaseUri
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request);
        return customize(req);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request, registrationId);
        return customize(req);
    }

    /**
     * 기본 OAuth2AuthorizationRequest에 extra 파라미터를 덧붙여서
     * 구글 authorize URL에 prompt=select_account 를 강제로 추가한다.
     */
    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest req) {
        if (req == null) {
            return null;
        }

        Map<String, Object> extraParams = new HashMap<>(req.getAdditionalParameters());
        // 👇 핵심: 매번 계정 선택 강제
        extraParams.put("prompt", "select_account");

        return OAuth2AuthorizationRequest
                .from(req)
                .additionalParameters(extraParams)
                .build();
    }
}
