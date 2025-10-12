package com.benefitmap.backend.auth.oauth;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

/**
 * OAuth2 프로필 로더
 * - provider 별 principal name attribute 결정(기본: sub, Google: sub)
 * - 권한은 빈 Set 유지(요구사항 기준)
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User delegate = super.loadUser(req);
        Map<String, Object> attrs = delegate.getAttributes();

        String registrationId = req.getClientRegistration().getRegistrationId();
        String nameAttrKey = resolveNameAttributeKey(registrationId);

        // 필수 속성 누락 시 인증 실패
        if (attrs == null || !attrs.containsKey(nameAttrKey)) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_user_info"),
                    "Missing principal attribute '" + nameAttrKey + "' for provider '" + registrationId + "'"
            );
        }

        return new DefaultOAuth2User(Set.of(), attrs, nameAttrKey);
    }

    /** provider 별 name attribute key */
    private String resolveNameAttributeKey(String registrationId) {
        if (registrationId == null) return "sub";
        switch (registrationId.toLowerCase()) {
            case "google": return "sub";
            // case "kakao":  return "id";
            // case "naver":  return "id";
            default: return "sub";
        }
    }
}
