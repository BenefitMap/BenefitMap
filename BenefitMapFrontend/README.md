# BenefitMap 프로젝트

## 🚀 빠른 시작

### 한 번에 실행하기
```bash
# 프로젝트 루트에서 실행 (백엔드 + 프론트엔드 모두 실행)
npm run dev
```

### 🌐 접속 주소
- **백엔드**: http://localhost:8080/
- **프론트엔드**: http://localhost:5173/

---

## 📋 처음 프로젝트를 실행할 때 필요한 필수 과정

### 1. 필수 소프트웨어 설치
- **Node.js 18+** (npm 포함)
- **Java 21**
- **MySQL 8.0**

### 2. MySQL 서버 설정

#### 2.1 MySQL 서버 실행
```bash
# 방법 1: 서비스로 실행 (관리자 권한 필요)
net start MySQL80

# 방법 2: 직접 실행
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="C:\mysql_data" --console
```

#### 2.2 데이터베이스 초기화
```bash
# MySQL에 연결
mysql -u root -p
```

```sql
-- 데이터베이스 생성 및 스키마 실행
CREATE DATABASE IF NOT EXISTS benefitmap CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE benefitmap;
SOURCE BenefitMapBackend/src/main/resources/db/migration/V1__auth.sql;

-- root 계정 비밀번호 설정
ALTER USER 'root'@'localhost' IDENTIFIED BY '1234';
```

### 3. 프로젝트 의존성 설치
```bash
# 루트에서 실행 (자동으로 프론트엔드도 설치됨)
npm install
```

### 4. 환경변수 설정 확인
`BenefitMapBackend/.env` 파일이 올바르게 설정되어 있는지 확인:

### 5. 서버 실행
```bash
# 루트에서 실행 - 백엔드와 프론트엔드 모두 실행됨
npm run dev
```

---

## ⚠️ 주의사항

1. **MySQL 서버가 먼저 실행되어야 함** - 백엔드가 MySQL에 연결해야 하므로
2. **관리자 권한** - MySQL 서비스 시작 시 필요할 수 있음
3. **포트 충돌** - 8080, 5173 포트가 사용 중이지 않은지 확인
4. **Java 21** - 백엔드 실행을 위해 필요

---

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. MySQL 연결 오류
```bash
# 비밀번호가 1234로 설정되어 있는지 확인
mysql -u root -p1234 -e "SELECT 'Connection successful';"
```

#### 2. 포트 충돌 오류
```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr ":8080"
netstat -ano | findstr ":5173"

# 프로세스 종료 (PID로)
taskkill /PID <PID번호> /F
```

#### 3. Java 버전 오류
```bash
# Java 버전 확인
java -version

# Java 21이 설치되어 있는지 확인
```

#### 4. Node.js 버전 오류
```bash
# Node.js 버전 확인
node -version

# npm 버전 확인
npm -version
```

---

## 📁 프로젝트 구조

```
BenefitMap/
├── BenefitMapFrontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── screens/             # 페이지 컴포넌트
│   │   ├── hooks/               # 커스텀 훅
│   │   ├── utils/               # 유틸리티 함수
│   │   └── styles/              # 스타일 관련
│   ├── package.json
│   └── vite.config.js
├── BenefitMapBackend/           # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/benefitmap/backend/
│   │       ├── controller/      # REST API 컨트롤러
│   │       ├── service/         # 비즈니스 로직
│   │       ├── repository/      # 데이터 접근 계층
│   │       ├── entity/          # JPA 엔티티
│   │       └── config/          # 설정 클래스
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/        # 데이터베이스 마이그레이션
│   ├── .env                     # 환경변수 설정
│   └── build.gradle
└── package.json                 # 루트 package.json (concurrently 설정)
```

---

## 🛠️ 개발 명령어

### 프론트엔드
```bash
cd BenefitMapFrontend
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

### 백엔드
```bash
cd BenefitMapBackend
./gradlew bootRun    # 개발 서버 실행
./gradlew build      # 프로덕션 빌드
./gradlew test       # 테스트 실행
```

### 전체 프로젝트
```bash
# 루트에서
npm run dev          # 백엔드 + 프론트엔드 동시 실행
npm install          # 모든 의존성 설치
```

---

## 🔐 인증 시스템

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

---

## 📊 주요 기능

### 1. 복지 서비스 검색
- **실시간 검색**: 키워드, 필터 기반 검색
- **다양한 필터**: 생애주기, 가구상황, 관심주제
- **지역별 검색**: 시/도, 시/군/구 선택

### 2. 맞춤 추천 시스템
- **개인화된 추천**: 사용자 설정 기반 복지 서비스 추천
- **마이페이지**: 개인정보 및 설정 관리

### 3. 캘린더 기능
- **일정 관리**: 복지 서비스 신청 기간 관리
- **알림 시스템**: 마감일 알림 기능

---

## 🚀 배포

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
cd BenefitMapFrontend
npm run build

# 백엔드 빌드
cd BenefitMapBackend
./gradlew build
```

### 환경변수 설정 (프로덕션)
- `app.cookie.secure=true` (HTTPS 환경)
- `CORS_ORIGINS=https://yourdomain.com`
- 프로덕션 데이터베이스 설정

---

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. MySQL 서버가 실행 중인지
2. 포트 8080, 5173이 사용 가능한지
3. Java 21과 Node.js 18+가 설치되어 있는지
4. 환경변수가 올바르게 설정되어 있는지

---

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.