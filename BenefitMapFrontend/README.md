# BenefitMap 프론트엔드

React 기반의 복지 추천 웹서비스 프론트엔드입니다.

---

## 빠른 시작

### 전체 프로젝트 실행 (권장)

프로젝트 루트에서 백엔드와 프론트엔드를 동시에 실행:

```bash
# 프로젝트 루트에서
npm install
npm run dev
```

**접속 주소**:
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8080

### 프론트엔드만 실행

```bash
cd BenefitMapFrontend
npm install
npm run dev
```

---

## 필수 요구사항

- **Node.js 18+** (https://nodejs.org/)
- **npm 9+**

### 설치 확인

```bash
node -v      # v18.x.x 이상
npm -v       # v9.x.x 이상
```

---

## 프로젝트 구조

```
BenefitMapFrontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Notification.jsx
│   │   └── ...
│   ├── screens/             # 페이지 컴포넌트
│   │   ├── MainPage.jsx
│   │   ├── ServicePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── ...
│   ├── hooks/               # 커스텀 훅
│   │   ├── useAuth.js
│   │   ├── useNotifications.js
│   │   └── ...
│   ├── utils/               # 유틸리티 함수
│   │   ├── auth.js
│   │   └── ...
│   └── styles/              # 스타일 관련
│       ├── CommonStyles.js
│       └── GlobalStyle.js
├── public/                  # 정적 파일
│   ├── fonts/
│   └── vite.svg
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 린팅
npm run lint
```

---

## 기술 스택

- **React 19.1.1** - UI 라이브러리
- **Vite 7.1.6** - 빌드 도구 및 개발 서버
- **React Router DOM 6.30.1** - 클라이언트 사이드 라우팅
- **Styled Components 6.1.19** - CSS-in-JS 스타일링

---

## 개발 환경 설정

### Vite 개발 서버

프로젝트는 Vite를 사용하여 개발 서버를 실행합니다.

- **포트**: 5173
- **프록시 설정**: `/api`, `/user` 요청은 백엔드(`http://localhost:8080`)로 프록시됩니다.

### 환경 변수

프론트엔드는 별도의 환경 변수가 필요하지 않습니다. 백엔드 API 주소는 `vite.config.js`에서 설정되어 있습니다.

---

## 주요 기능

### 1. 복지 서비스 검색
- 키워드 검색
- 필터 기반 검색 (생애주기, 가구상황, 관심주제)
- 지역별 검색 (시/도, 시/군/구)

### 2. 사용자 인증
- Google OAuth2 로그인
- JWT 토큰 기반 인증
- 자동 로그인 유지

### 3. 맞춤 추천
- 사용자 프로필 기반 복지 서비스 추천
- 즐겨찾기 기능
- 마이페이지에서 설정 관리

### 4. 캘린더
- 복지 서비스 신청 기간 관리
- 마감일 알림

---

## 문제 해결

### 포트 충돌 오류

```bash
# Windows: 포트 사용 중인 프로세스 확인 및 종료
netstat -ano | findstr ":5173"
taskkill /PID <PID번호> /F
```

### 의존성 설치 오류

```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류

```bash
# Vite 캐시 삭제
rm -rf node_modules/.vite
npm run build
```

---

## 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 환경 설정

프로덕션 환경에서는 `vite.config.js`의 `BACKEND_TARGET`을 프로덕션 백엔드 주소로 변경해야 합니다.

---

## 참고사항

- 전체 프로젝트 실행 방법은 루트의 `README.md`를 참고하세요.
- 백엔드가 실행 중이어야 API 요청이 정상적으로 작동합니다.
- 개발 서버는 Hot Module Replacement(HMR)를 지원합니다.
