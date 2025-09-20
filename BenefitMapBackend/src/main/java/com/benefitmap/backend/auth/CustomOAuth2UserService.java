package com.benefitmap.backend.auth;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

/**
 * OAuth2 프로필을 불러와 제공자의 고유 키 "sub"를 principal 이름으로 사용합니다.
 * 여기서는 권한 부여나 로컬 사용자 연동을 하지 않습니다(권한 비움).
 * 이후 성공 핸들러/서비스에서 계정 생성·연동·권한 설정을 처리하세요.
 * 현재는 Google("sub") 기준이며, 다른 제공자 추가 시 키 매핑이 필요할 수 있습니다.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User u = super.loadUser(req);
        Map<String, Object> attrs = u.getAttributes();
        return new DefaultOAuth2User(Set.of(), attrs, "sub");
    }
}
