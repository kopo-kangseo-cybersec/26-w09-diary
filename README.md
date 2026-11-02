# 감정 일기 — React + Supabase (`26-w09-diary`)

## 소개

- 하루의 감정 5가지(기쁨, 평온, 슬픔, 화남, 불안) 중 하나를 골라 짧은 일기를 남기는 웹앱
- 일기 작성, 최신순 목록 조회, 삭제, 감정별 필터 기능
- 데이터를 Supabase에 저장해서 PC, 스마트폰 등 어느 기기에서 열어도 같은 기록 확인 가능

## 어떻게 만들었나요

- Supabase SQL Editor에서 diaries 테이블, grant, RLS 정책을 먼저 정의
- .env.local에 Supabase URL과 Publishable Key 등록
- Copilot에 PRD를 전달해 구현 계획을 먼저 받고 검토 후 구현 진행
  - Supabase 클라이언트: src/lib/supabase.js
  - 조회, 추가, 삭제 함수: src/api/diaries.js
  - 스타일: Tailwind CSS v4 (@tailwindcss/vite)
- npm run dev로 저장, 새로고침 유지, 삭제, 필터 동작 직접 확인
- Netlify(dev 브랜치 자동 빌드)와 GitHub Pages(로컬 빌드 후 gh-pages 배포) 두 곳에 배포

## 데이터는 어디에 저장되나요

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | bigint | 자동 생성 기본키 |
| content | text | 일기 본문 (필수, 1~500자) |
| emotion | text | joy, calm, sad, angry, anxious 중 하나 (check 제약) |
| created_at | timestamptz | 작성 시각 (기본값 now()) |

- 8주차 To-Do: 브라우저 localStorage에 저장 → 기기나 브라우저가 바뀌면 데이터 없음
- 9주차 감정 일기: Supabase(클라우드 PostgreSQL)에 저장 → 스마트폰이나 다른 브라우저에서 열어도 같은 목록
- Netlify, GitHub Pages, 스마트폰 세 곳에서 작성, 삭제한 내용이 새로고침 시 모두 동일하게 반영되는 것 확인

## 보안에서 확인한 것 (사이버보안과 체크포인트)

키 보관
- Supabase URL과 Publishable Key는 .env.local에만 보관
- .gitignore에 .env.* 가 등록되어 git status에서도 추적되지 않는 것 확인
- 키를 코드에 직접 쓰면 커밋 기록에 남아, 나중에 지워도 히스토리로 복구 가능
- sb_secret 키는 RLS를 우회하는 관리자 키라 프론트엔드에서 사용하지 않음

브라우저에서 키 노출 확인
- 개발자 도구 Network 탭에서 diaries 요청의 Request Headers 확인
- apikey, authorization 헤더에 Publishable Key가 그대로 보임
- npm run build 결과물(dist/assets/*.js)에도 URL과 키가 그대로 포함됨
- 프론트엔드 코드는 사용자 브라우저에서 실행되므로 키가 전달될 수밖에 없음
- .env.local의 역할은 키를 숨기는 것이 아니라 GitHub에 박제되는 것을 막는 것
- 실제로 데이터를 지키는 것은 DB의 grant(테이블 단위 작업 권한)와 RLS(행 단위 접근 제어)

현재 RLS 정책(using (true))의 한계
- select, insert, delete 정책이 모두 조건 없이 전부 허용
- Publishable Key는 누구나 볼 수 있으므로, 키를 가진 사람은 앱 화면을 거치지 않고 API로 직접
  - 모든 사람의 일기 조회
  - 임의 데이터 대량 삽입
  - 다른 사람의 일기 삭제 가능
- update는 grant하지 않아 수정은 차단됨
- 실제 서비스라면 Supabase Auth로 로그인을 붙이고 user_id 컬럼을 추가한 뒤 auth.uid() = user_id 조건으로 본인 행만 읽기, 삭제 가능하도록 변경 필요

트러블슈팅
- .env.local에 키를 붙여넣다 sb_publishable_ 접두어가 두 번 들어가 Invalid API key 오류 발생
- 값 수정 후 개발 서버 재시작으로 해결 (Vite는 서버 시작 시점에만 환경변수를 읽음)

## 실행 및 배포 링크

- Netlify 배포 URL: https://mellow-syrniki-81c26d.netlify.app
- GitHub Pages 배포 URL: https://mojodori.github.io/26-w09-diary/

## 커스터마이징한 부분

- 일기 길이 500자 제한: textarea maxLength와 글자 수 카운터 + DB check 제약(char_length) 추가
  - 화면 제한은 API 직접 호출로 우회 가능하므로 DB에서도 검증
- 삭제 전 확인 창 추가