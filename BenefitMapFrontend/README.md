# BenefitMap 프로젝트

## 주요 기능

### 1. 인증 시스템
- **구글 OAuth 로그인**: 간편한 소셜 로그인
- **자동 리다이렉트**: 로그인 후 적절한 페이지로 이동
- **로그아웃**: 클라이언트 사이드 로그아웃 처리

### 2. 복지 서비스 검색
- **실시간 검색**: 키워드, 필터 기반 검색
- **다양한 필터**: 생애주기, 가구상황, 관심주제
- **지역별 검색**: 시/도, 시/군/구 선택
- **자동 로딩**: 페이지 진입 시 자동으로 서비스 목록 표시

### 3. 맞춤 추천 시스템
- **개인화된 추천**: 사용자 설정 기반 복지 서비스 추천
- **마이페이지**: 개인정보 및 설정 관리
- **설정 페이지**: 상세한 맞춤 설정

### 4. 캘린더 기능
- **일정 관리**: 복지 서비스 신청 기간 관리
- **알림 시스템**: 마감일 알림 기능
- **로그인 제한**: 로그인한 사용자만 캘린더 기능 사용 가능

## 설치 및 실행 가이드

### 1. 프론트엔드 설치 및 실행

#### 1.1 필수 요구사항
- Node.js (v16 이상)
- npm 또는 yarn

#### 1.2 설치 명령어
```bash
# 1. 프로젝트 디렉토리로 이동
cd BenefitMapFrontend

# 2. 의존성 설치
npm install

# 3. 환경변수 설정 (.env 파일 생성)
# VITE_API_BASE_URL=http://localhost:8080
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

# 4. 개발 서버 실행
npm run dev
```

#### 1.3 접속 정보
- **개발 서버**: http://localhost:5173
- **빌드**: `npm run build`
- **프리뷰**: `npm run preview`

### 2. 백엔드 설치 및 실행

#### 2.1 필수 요구사항
- Java 17 이상
- MySQL 8.0 이상
- Gradle 7.0 이상

#### 2.2 설치 명령어
```bash
# 1. 프로젝트 디렉토리로 이동
cd BenefitMapBackend

# 2. 환경변수 설정 (Windows PowerShell)
$env:JWT_SECRET="your_jwt_secret_key_here"
$env:GOOGLE_CLIENT_ID="your_google_client_id"
$env:GOOGLE_CLIENT_SECRET="your_google_client_secret"
$env:DB_PASSWORD="your_mysql_password"

# 3. 데이터베이스 설정
# MySQL에서 데이터베이스 생성
CREATE DATABASE benefitmap;

# 4. 애플리케이션 실행
./gradlew bootRun
```

#### 2.3 접속 정보
- **서버**: http://localhost:8080
- **API 문서**: http://localhost:8080/swagger-ui.html

```

## 기술 스택

### Frontend
- **React 18**: 함수형 컴포넌트, Hooks
- **React Router**: 클라이언트 사이드 라우팅
- **Styled Components**: CSS-in-JS 스타일링
- **Vite**: 빌드 도구 및 개발 서버
- **Axios**: HTTP 클라이언트

## 프로젝트 구조


BenefitMap/
├── BenefitMapFrontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/          # 재사용 가능한 컴포넌트
│   │   │   ├── Header.jsx       # 헤더 (네비게이션, 로그인 상태)
│   │   │   ├── Footer.jsx       # 푸터
│   │   │   └── ScrollToTopButton.jsx
│   │   ├── screens/             # 페이지 컴포넌트
│   │   │   ├── MainPage.jsx     # 메인 페이지
│   │   │   ├── ServicePage.jsx  # 복지 서비스 검색
│   │   │   ├── ServiceDetailPage.jsx # 서비스 상세
│   │   │   ├── LoginPage.jsx    # 로그인 페이지
│   │   │   ├── SettingPage.jsx  # 설정 페이지
│   │   │   ├── MyPage.jsx       # 마이페이지
│   │   │   ├── Calendar.jsx     # 캘린더 페이지
│   │   │   └── SignupComplete.jsx
│   │   ├── hooks/               # 커스텀 훅
│   │   │   ├── useAuth.js       # 인증 관련 훅
│   │   │   └── useNotifications.js
│   │   ├── utils/               # 유틸리티 함수
│   │   │   └── auth.js          # 인증 관련 함수
│   │   ├── styles/              # 스타일 관련
│   │   │   └── CommonStyles.js  # 공통 스타일
│   │   └── App.jsx              # 메인 앱 컴포넌트
│   ├── package.json
│   └── vite.config.js
└── BenefitMapBackend/           # Spring Boot 백엔드
    ├── src/main/java/
    │   └── com/benefitmap/backend/
    │       ├── BeneFitMapBackendApplication.java
    │       ├── controller/      # REST API 컨트롤러
    │       ├── service/         # 비즈니스 로직
    │       ├── repository/      # 데이터 접근 계층
    │       ├── entity/          # JPA 엔티티
    │       └── config/          # 설정 클래스
    ├── src/main/resources/
    │   └── application.properties
    └── build.gradle


## 주요 기능 상세

### 1. 복지 서비스 검색 시스템
- **실시간 필터링**: 생애주기, 가구상황, 관심주제별 필터
- **키워드 검색**: 서비스명, 설명 기반 검색
- **지역별 검색**: 전국 17개 시/도, 229개 시/군/구 지원
- **자동 로딩**: 페이지 진입 시 즉시 서비스 목록 표시

### 2. 맞춤 추천 시스템
- **개인화 알고리즘**: 사용자 설정 기반 추천
- **다단계 설정**: 필수/선택 항목 구분
- **실시간 업데이트**: 설정 변경 시 즉시 반영

### 3. 캘린더 관리
- **일정 추가**: 복지 서비스 신청 기간 캘린더에 추가
- **알림 기능**: 마감일 3일 전 이메일 알림
- **로그인 제한**: 로그인한 사용자만 사용 가능

## 보안 및 인증

### OAuth 2.0 인증 플로우
1. 사용자가 구글 로그인 버튼 클릭
2. 구글 OAuth 서버로 리다이렉트
3. 사용자 인증 후 백엔드로 인증 코드 전송
4. 백엔드에서 JWT 토큰 생성 및 쿠키에 저장
5. 프론트엔드로 사용자 정보 전송

### 보안 기능
- **CORS 설정**: 프론트엔드 도메인만 허용
- **JWT 토큰**: 쿠키 기반 토큰 관리
- **입력 검증**: 클라이언트/서버 양쪽 검증


## 문제 해결

### 자주 발생하는 문제
1. **CORS 오류**: 백엔드 CORS 설정 확인
2. **OAuth 오류**: 구글 클라이언트 ID/Secret 확인
3. **데이터베이스 연결 오류**: MySQL 서버 상태 및 설정 확인
4. **빌드 오류**: Node.js/Java 버전 확인

### 로그 확인
- **프론트엔드**: 브라우저 개발자 도구 콘솔
- **백엔드**: 터미널 출력 또는 로그 파일


---
