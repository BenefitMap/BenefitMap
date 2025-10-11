# BenefitMap 프론트엔드 프로젝트

## 🚀 주요 기능

### 1. 구글 OAuth 로그인
- **파일**: `src/screens/LoginPage.jsx`
- **기능**: 구글 계정을 통한 간편 로그인
- **백엔드 연동**: Spring Boot OAuth2 서버와 연동
- **리다이렉트**: 로그인 성공 시 설정 페이지로 자동 이동

### 2. 혜택 맞춤 설정 페이지
- **파일**: `src/screens/SettingPage.jsx`
- **주요 기능**:
  - **지역 선택**: 시/도 → 시/군/구 연동 드롭다운 (전국 17개 시/도, 229개 시/군/구)
  - **개인정보 입력**: 나이(0-150), 성별, 생애주기
  - **선택사항**: 가구상황, 관심주제 (15개 카테고리)
  - **UI/UX**: 초록색 체크박스, 나이 증감 버튼, 굵은 라벨 텍스트
- **유효성 검사**: 필수 항목 검증 후 마이페이지로 이동
- **데이터 저장**: localStorage를 통한 설정값 저장

## 핵심 기능
1. **비회원 검색/필터**: 체크박스+입력으로 복지 검색/추천
2. **회원 자동 추천**: 가입 시 입력한 기본조건(성별/출생연도/지역/가구상황/생애주기/관심주제)으로 선필터
3. **즐겨찾기**: 관심 복지 저장/관리
4. **알림**: 즐겨찾기한 복지 **마감 3일 전** 이메일 알림
5. **캘린더**
   - 회원: 내 즐겨찾기 일정(신청 시작/마감) 표시
   - 비회원: 최근 30일 **즐겨찾기 Top-N** 공개 캘린더

### 3. 마이페이지
- **파일**: `src/screens/MyPage.jsx`
- **레이아웃**: 가로 배치된 두 섹션 (개인정보 | 맞춤설정)
- **주요 기능**:
  - **개인정보 관리**: 이름, 나이(스핀버튼), 성별, 주소, 이메일(2개 필드)
  - **맞춤설정 관리**: 지역, 생애주기, 가구상황, 관심주제
  - **수정 기능**: "수정" 버튼으로 편집 모드 전환
  - **데이터 연동**: SettingPage에서 입력한 값 자동 표시
- **디자인**: 초록색 배경, 흰색 카드 섹션, 반응형 디자인

### 4. 회원가입 완료 페이지
- **파일**: `src/screens/SignupComplete.jsx`
- **기능**: 로그인 완료 후 환영 메시지 및 설정 페이지 이동
- **자동 리다이렉트**: 3초 후 설정 페이지로 자동 이동

### 5. OAuth 콜백 처리
- **파일**: `src/screens/OAuthCallback.jsx`
- **기능**: 구글 OAuth 인증 완료 후 처리
- **리다이렉트**: 설정 페이지로 자동 이동

## 🎨 UI/UX 특징

### 디자인 시스템
- **주요 색상**: 초록색 (#91D0A6) 배경, 흰색 입력 필드
- **체크박스**: 초록색 액센트 (#6DBE89)
- **레이아웃**: 가로 배치 우선, 반응형 디자인
- **타이포그래피**: 일반 글씨체 (font-weight: 400)

### 컴포넌트 구조
- **재사용 가능한 드롭다운**: `CustomCheckboxDropdown` 컴포넌트
- **스타일드 컴포넌트**: CSS-in-JS 방식으로 스타일링
- **반응형 디자인**: 모바일에서는 세로 배치로 자동 전환

## 🔧 기술 스택

### Frontend
- **React 18**: 함수형 컴포넌트, Hooks 사용
- **React Router**: 페이지 라우팅
- **Styled Components**: CSS-in-JS 스타일링
- **Vite**: 빌드 도구 및 개발 서버

### Backend 연동
- **Spring Boot**: OAuth2 서버
- **JWT**: 인증 토큰 관리
- **MySQL**: 데이터베이스

## 📁 프로젝트 구조

```
src/
├── components/             # 재사용 가능한 컴포넌트
│   ├── Header.jsx          # 헤더 컴포넌트 (로고, 네비게이션, 로그인 상태)
│   ├── Footer.jsx          # 푸터 컴포넌트
│   ├── UserInfo.jsx        # 사용자 정보 표시 컴포넌트
│   ├── MailNotification.jsx # 메일 알림 컴포넌트
│   ├── Notification.jsx    # 알림 컴포넌트
│   └── ScrollToTopButton.jsx # 스크롤 탑 버튼
├── screens/                # 페이지 컴포넌트
│   ├── LoginPage.jsx       # 구글 OAuth 로그인 페이지
│   ├── SettingPage.jsx     # 혜택 맞춤 설정 페이지
│   ├── MyPage.jsx          # 마이페이지 (개인정보 관리)
│   ├── MainPage.jsx        # 메인 페이지
│   ├── ServicePage.jsx     # 서비스 페이지
│   ├── Calendar.jsx        # 캘린더 페이지
│   ├── SignupComplete.jsx  # 회원가입 완료 페이지
│   └── OAuthCallback.jsx   # OAuth 콜백 처리 페이지
├── hooks/                  # 커스텀 훅
│   ├── useAuth.js          # 인증 상태 관리 훅
│   └── useClickOutside.js  # 외부 클릭 감지 훅
├── styles/                 # 스타일 관련
│   ├── GlobalStyle.js      # 전역 스타일
│   └── CommonStyles.js     # 공통 스타일 시스템
├── utils/                  # 유틸리티 함수
│   ├── auth.js             # 인증 관련 유틸리티
│   └── googleAuth.js       # 구글 OAuth 유틸리티 함수
├── assets/                 # 정적 자산
│   ├── BenefitMapLogo.png  # 로고 이미지
│   ├── google-logo.svg     # 구글 로고
│   ├── mypage.png          # 마이페이지 아이콘
│   └── menubar.png         # 메뉴바 아이콘
└── App.jsx                 # 메인 앱 컴포넌트 (라우팅)
```

## 🚀 실행 방법

### 1. 환경변수 설정 (중요!)
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# .env 파일 생성
touch .env
```

```env
# Google OAuth 설정
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT 설정
JWT_ACCESS_EXP=3600
JWT_REFRESH_EXP=1209600

# 데이터베이스 설정
DB_PASSWORD=your_mysql_password

# 메일 설정 (선택사항)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# CORS 설정
CORS_ORIGINS=http://localhost:5173
```

### 2. Frontend 실행
```bash
cd BenefitMapFrontend
npm install
npm run dev
```
- 개발 서버: http://localhost:5173

### 3. Backend 실행
```bash
cd BenefitMapBackend
# 환경변수를 로드하여 백엔드 실행
export $(cat ../.env | xargs) && ./gradlew bootRun
```

**Windows 사용자의 경우:**
```bash
cd BenefitMapBackend
# PowerShell에서
Get-Content ../.env | ForEach-Object { if($_ -match "^([^#][^=]+)=(.*)$") { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }
./gradlew bootRun

# 또는 CMD에서
for /f "usebackq tokens=1,2 delims==" %i in (../.env) do set %i=%j
./gradlew bootRun
```

- 서버: http://localhost:8080

## 🔐 환경 설정

### Frontend (.env)
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_API_URL=http://localhost:8080
```

### Backend (application.properties)
```
app.oauth2.redirect=http://localhost:5173/signup-complete?loggedIn=true
CORS_ORIGINS=http://localhost:5173
```

## 📊 데이터 구조

### 사용자 설정 데이터 (localStorage)
```javascript
{
  region1: "경기도",           // 시/도
  region2: "안양시",           // 시/군/구
  age: "25",                  // 나이
  gender: "여성",              // 성별
  lifeCycle: "청년",           // 생애주기
  household: "해당사항 없음",   // 가구상황
  interest: "신체건강, 교육"    // 관심주제
}
```

## 🎯 사용자 플로우

1. **로그인**: 구글 OAuth → SignupComplete 페이지
2. **설정**: SettingPage에서 개인정보 및 관심사 입력
3. **완료**: 마이페이지로 이동하여 정보 확인/수정 가능
4. **관리**: 헤더의 "마이페이지" 링크로 언제든 접근 가능

## 🛠️ 트러블슈팅

### Google OAuth 로그인 오류
**문제**: `invalid_client` 오류 발생
**원인**: 환경변수가 제대로 로드되지 않음
**해결방법**:
```bash
# 1. .env 파일이 프로젝트 루트에 있는지 확인
ls -la .env

# 2. 환경변수를 로드하여 백엔드 실행
cd BenefitMapBackend
export $(cat ../.env | xargs) && ./gradlew bootRun

# 3. OAuth 클라이언트 ID 확인
curl -I http://localhost:8080/oauth2/authorization/google
```

### 프론트엔드 빌드 오류
**문제**: 의존성 설치 실패
**해결방법**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 또는 yarn 사용
yarn install
```

### 데이터베이스 연결 오류
**문제**: MySQL 연결 실패
**해결방법**:
```bash
# 1. MySQL 서비스 시작
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# 2. 데이터베이스 생성
mysql -u root -p
CREATE DATABASE benefitmap;
```

## 🔄 주요 업데이트 내역

### v1.2.0 (최신)
- ✅ **프론트엔드 아키텍처 개선**
  - 공통 스타일 시스템 구축 (CommonStyles.js)
  - 커스텀 훅 추가 (useAuth, useClickOutside)
  - 컴포넌트 성능 최적화
  - 코드 재사용성 향상
- ✅ **Google OAuth 로그인 수정**
  - invalid_client 오류 해결
  - 환경변수 설정 개선
- ✅ **코드 품질 개선**
  - 중복 파일 제거
  - 불필요한 의존성 정리
  - 메모리 누수 방지

### v1.1.0
- ✅ **UI/UX 개선**
  - 일관된 디자인 시스템 적용
  - 반응형 디자인 최적화
  - 접근성 개선

### v1.0.0
- ✅ 구글 OAuth 로그인 구현
- ✅ 혜택 맞춤 설정 페이지 완성
- ✅ 마이페이지 구현 (가로 레이아웃)
- ✅ 반응형 디자인 적용
- ✅ 데이터 연동 및 저장 기능
- ✅ UI/UX 개선 (초록색 테마, 스핀버튼 등)

## 👨‍💻 개발자 가이드

### 코드 스타일 가이드
- **컴포넌트**: 함수형 컴포넌트 사용
- **스타일링**: Styled Components 사용
- **상태 관리**: React Hooks (useState, useEffect, useCallback)
- **라우팅**: React Router v6
- **API 호출**: fetch API 사용

### 새로운 컴포넌트 추가 시
1. **스타일**: `CommonStyles.js`의 공통 스타일 활용
2. **컴포넌트**: `components/` 폴더에 재사용 가능한 컴포넌트
3. **페이지**: `screens/` 폴더에 페이지 컴포넌트
4. **훅**: `hooks/` 폴더에 커스텀 훅

### 환경변수 관리
- **백엔드**: `.env` 파일의 환경변수 사용
- **프론트엔드**: `import.meta.env.VITE_*` 사용
- **보안**: 민감한 정보는 환경변수로 관리

### 성능 최적화 팁
- **컴포넌트**: useCallback, useMemo 적절히 사용
- **이벤트**: 이벤트 리스너 정리 (cleanup)
- **이미지**: 적절한 크기와 형식 사용
- **번들**: Vite의 코드 스플리팅 활용

## 👥 팀원 확인사항

### 개발 완료된 기능
- [x] 로그인 시스템 (구글 OAuth)
- [x] 사용자 설정 페이지
- [x] 마이페이지 (개인정보 관리)
- [x] 반응형 디자인
- [x] 데이터 저장/불러오기
- [x] 프론트엔드 아키텍처 개선
- [x] 공통 스타일 시스템

### 테스트 필요사항
- [x] 구글 OAuth 로그인 플로우
- [x] 설정 페이지 → 마이페이지 데이터 연동
- [ ] 마이페이지 수정 기능
- [ ] 반응형 디자인 (모바일/태블릿)
- [ ] 브라우저 호환성
- [ ] 성능 테스트

### 다음 개발 우선순위
1. **서비스 페이지 기능 완성**
2. **캘린더 기능 구현**
3. **알림 시스템 구현**
4. **테스트 코드 작성**
5. **배포 환경 구성**

