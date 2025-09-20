# 복지 추천 웹서비스 (BenefitMap)

정부(중앙·지자체) 복지 API를 통합해 **지역·성별·나이·가구상황·관심주제** 등 조건으로
“내가 받을 수 있는 복지”를 추천하고, **즐겨찾기/캘린더/마감 D-3 이메일** 알림 기능을 제공합니다.

---

## 핵심 기능
1. **비회원 검색/필터**: 체크박스+입력으로 복지 검색/추천
2. **회원 자동 추천**: 가입 시 입력한 기본조건(성별/출생연도/지역/가구/소득/관심주제)으로 선필터
3. **즐겨찾기**: 관심 복지 저장/관리
4. **알림**: 즐겨찾기한 복지 **마감 3일 전** 이메일 알림
5. **캘린더**
    - 회원: 내 즐겨찾기 일정(신청 시작/마감) 표시
    - 비회원: 최근 30일 **즐겨찾기 Top-N** 공개 캘린더

---

## 로컬 실행 (원커맨드)
최상위 폴더에서 백엔드+프론트엔드 동시 실행

요구: Node 18+
```
cd BenefitMap
npm install
npm run dev
# FE: http://localhost:5173
# BE: http://localhost:8080
```

---

## 작업 규칙
1. cd 본인프로젝트(BenefitMapFrontend/BenefitMapBackend) 로 이동 후 작업
2. 테스트시 cd .. 로 상위 폴더 BenefitMap으로 이동 후 npm run dev 로 테스트
3. 깃허브에 올릴시 cd.. 로 상위 폴더 BenefitMap으로 이동 후 커밋

---

## Git & GitHub 규칙
1. `main`은 배포용, `dev`는 통합용. **작업은 항상 `feature/*` 브랜치**에서
2.  작업 전 **이슈 생성** → 브랜치: `feature/<이슈번호>-<짧은설명>` (예: `feature/1-catalog-search`)
3. 브랜치 만들기 전 `dev` 최신화 후 분기:
   ```
    git fetch origin
    git checkout -b feature/1-catalog-search origin/dev
    git push -u origin feature/1-catalog-search
   ```
4. 커밋 메시지는 **Conventional Commits** 규칙 사용 + 이슈 번호 부여(한글 OK)
   <br>(ex. feat: #1 카테고리 검색 기능 추가)

   | 타입 | 설명 |
      |---|---|
   | feat | 기능 추가 |
   | fix | 버그 수정 |
   | refactor | 리팩터링 |
   | perf | 성능 개선 |
   | test | 테스트 |
   | docs | 문서 |
   | style | 포맷/세미콜론 등 |
   | build | 빌드/의존성 |
   | ci | CI 설정 |
   | chore | 기타 |
   | revert | 되돌리기 |
5. PR: `feature/*` → `dev`는 스쿼시 머지 + 최소 1명 리뷰
6. `main`은 보호 브랜치: 직접 푸시 금지, 릴리즈 PR로만 `dev` → `main` 머지

