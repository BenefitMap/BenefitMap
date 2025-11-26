# 복지 추천 웹서비스 (BenefitMap)

정부(중앙·지자체) 복지 API를 통합해 **지역·성별·나이·가구상황·관심주제** 등 조건으로
"내가 받을 수 있는 복지"를 추천하고, **즐겨찾기/캘린더/마감 D-3 이메일** 알림 기능을 제공합니다.

---

## 빠른 시작

### 실행 순서

1. **필수 소프트웨어 설치**
   - Node.js 18+ (https://nodejs.org/)
   - Java 21 (https://adoptium.net/)
   - MySQL 8.0+ (https://dev.mysql.com/downloads/mysql/)

2. **MySQL 데이터베이스 설정**
3. **환경변수(.env) 파일 설정**
4. **의존성 설치 및 실행**

```bash
npm install
npm run dev
```

**접속 주소**:
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8080
- API 문서: http://localhost:8080/swagger-ui.html

---

## 상세 설정 가이드

### 1. 필수 소프트웨어 설치

#### 설치 확인
```bash
node -v      # v18.x.x 이상
java -version    # openjdk version "21"
mysql --version  # mysql Ver 8.0.x
```

---

### 2. MySQL 데이터베이스 설정

#### 2-1. MySQL 서버 실행

**Windows:**
```bash
net start MySQL80
```

**macOS/Linux:**
```bash
brew services start mysql    # macOS
sudo systemctl start mysql   # Linux
```

#### 2-2. 데이터베이스 생성 및 스키마 적용

```bash
# MySQL 접속
mysql -u root -p
```

MySQL 접속 후 다음 SQL 실행:

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS benefitmap 
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 데이터베이스 선택
USE benefitmap;

-- 스키마 파일 실행
SOURCE BenefitMapBackend/src/main/resources/db/migration/V1__auth.sql;
-- 또는 [`V1__auth.sql`](BenefitMapBackend/src/main/resources/db/migration/V1__auth.sql) 파일을 직접 열어서 내용 복사
```

**참고**: `SOURCE` 명령어가 작동하지 않으면, [`V1__auth.sql`](BenefitMapBackend/src/main/resources/db/migration/V1__auth.sql) 파일 내용을 직접 복사해서 실행하세요.

---

### 3. 환경변수 설정

`BenefitMapBackend/.env` 파일을 생성하고 다음 내용을 작성하세요:

```env
# 데이터베이스 설정
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# JWT 토큰 설정
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_ACCESS_EXP=3600
JWT_REFRESH_EXP=1209600

# Google OAuth2 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS 설정
CORS_ORIGINS=http://localhost:5173

# 이메일 설정 (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**중요 사항**:
- `JWT_SECRET`: 최소 32자 이상의 랜덤 문자열
- `GOOGLE_CLIENT_ID/SECRET`: Google Cloud Console에서 OAuth2 클라이언트 생성 필요
- `MAIL_PASSWORD`: Gmail 앱 비밀번호 사용 (일반 비밀번호 아님)

---

### 4. 프로젝트 실행

#### VS Code

1. VS Code에서 `BenefitMap` 폴더 열기
2. 터미널 열기 (`Ctrl + ``)
3. 다음 명령어 실행:

```bash
npm install
npm run dev
```

#### IntelliJ IDEA

1. IntelliJ에서 `BenefitMap` 폴더 열기
2. 터미널 탭 열기
3. 다음 명령어 실행:

```bash
npm install
npm run dev
```

**또는 백엔드만 IntelliJ에서 실행:**
- `BenefitMapBackend/src/main/java/com/benefitmap/backend/BenefitMapBackendApplication.java` 파일 열기
- `main` 메서드 왼쪽의 실행 버튼 클릭
- 프론트엔드는 별도 터미널에서 `cd BenefitMapFrontend && npm run dev`

---

## 문제 해결

### MySQL 연결 오류
```bash
# MySQL 서버 실행 확인
net start MySQL80    # Windows

# .env 파일의 DB_USERNAME, DB_PASSWORD 확인
# 데이터베이스 benefitmap이 생성되었는지 확인
```

### 포트 충돌 오류
```bash
# Windows: 포트 사용 중인 프로세스 확인 및 종료
netstat -ano | findstr ":8080"
taskkill /PID <PID번호> /F
```

### Java/Node.js 버전 오류
```bash
# 버전 확인
java -version    # Java 21 필요
node -v          # Node.js 18+ 필요
```

### 환경변수 오류
- `BenefitMapBackend/.env` 파일이 존재하는지 확인
- 모든 환경변수가 올바르게 설정되었는지 확인

---

## 프로젝트 구조

```
BenefitMap/
├── BenefitMapFrontend/          # React 프론트엔드
│   ├── src/                     # 소스 코드
│   └── package.json
│
├── BenefitMapBackend/           # Spring Boot 백엔드
│   ├── src/main/java/           # Java 소스 코드
│   ├── src/main/resources/      # 설정 파일
│   │   └── db/migration/        # 데이터베이스 스키마
│   ├── .env                     # 환경변수 파일
│   └── build.gradle
│
└── package.json                 # 루트 설정 (concurrently)
```

---

## 주요 명령어

```bash
# 전체 프로젝트 실행 (백엔드 + 프론트엔드)
npm install
npm run dev

# 프론트엔드만 실행
cd BenefitMapFrontend
npm run dev

# 백엔드만 실행
cd BenefitMapBackend
./gradlew bootRun
```

---

## 실행 체크리스트

프로젝트 실행 전 확인사항:

- [ ] Node.js 18+, Java 21, MySQL 8.0+ 설치됨
- [ ] MySQL 서버 실행 중
- [ ] 데이터베이스 `benefitmap` 생성 및 스키마 적용됨
- [ ] `BenefitMapBackend/.env` 파일 생성 및 설정 완료
- [ ] 포트 8080, 5173 사용 가능

---

**실행 순서 요약**:
1. MySQL 설정 (데이터베이스 생성 + 스키마 적용)
2. `.env` 파일 설정
3. `npm install`
4. `npm run dev`
5. 브라우저에서 http://localhost:5173 접속
