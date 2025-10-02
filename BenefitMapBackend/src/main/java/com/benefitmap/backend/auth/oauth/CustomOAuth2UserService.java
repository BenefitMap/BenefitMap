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
 * OAuth2 프로필을 불러오고, 제공자별로 principal name attribute를 안전하게 선택한다.
 * - Google: "sub"
 * - (확장 여지) GitHub: "id", Kakao: "id" 등
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User delegate = super.loadUser(req);
        Map<String, Object> attrs = delegate.getAttributes();

        // registrationId에 따라 name attribute key 선택
        String registrationId = req.getClientRegistration().getRegistrationId();
        String nameAttrKey = resolveNameAttributeKey(registrationId);

        // 기본 키가 없으면 에러 처리(프로필 불완전)
        if (attrs == null || !attrs.containsKey(nameAttrKey)) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"),
                    "Missing principal attribute '" + nameAttrKey + "' for provider '" + registrationId + "'");
        }

        // 권한은 과제 요구대로 비움(Set.of())
        return new DefaultOAuth2User(Set.of(), attrs, nameAttrKey);
    }

    /**
     * 제공자별 principal name attribute key를 결정한다.
     * 필요 시 여기에 다른 소셜(provider) 분기를 추가.
     */
    private String resolveNameAttributeKey(String registrationId) {
        if (registrationId == null) return "sub"; // 안전 기본값
        switch (registrationId.toLowerCase()) {
            case "google":
                return "sub";
            // case "github": return "id";
            // case "kakao":  return "id";
            // case "naver":  return "id";
            default:
                // 미지정 provider는 우선 "sub"를 시도하고, 없으면 "id"를 시도
                return "sub";
        }
    }
}
