# 마음 한 페이지 — 감정 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 기기와 브라우저에 관계없이 확인하는 반응형 웹앱입니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 감정과 함께 일기 작성
- 작성 일시 최신순 목록과 감정별 필터
- Supabase에 일기 저장·조회·삭제
- 로딩, 저장 중, 빈 목록, 연결 오류 안내
- 모바일과 데스크톱 화면 지원

## 실행 방법

1. 의존성을 설치합니다: `npm install`
2. `.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트 정보를 입력합니다.
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
   ```
3. Vite 개발 서버를 실행합니다: `npm run dev`
4. 터미널에 표시되는 주소(기본값 `http://localhost:5173/`)를 엽니다. Live Server로 `index.html`을 직접 열면 React 앱은 실행되지 않습니다.

프로젝트의 `public.diaries` 테이블과 앱의 읽기·추가·삭제 권한 정책이 Supabase에 있어야 합니다. SQL 설정은 [`guide.md`](./guide.md)를 참고하세요. `.env.local`은 Git에 커밋하지 마세요.

## 데이터와 보안

일기 데이터는 Supabase의 `diaries` 테이블(`id`, `content`, `emotion`, `created_at`)에 저장됩니다. 브라우저가 Supabase와 직접 통신하며, 일기 작성·삭제 뒤 목록을 다시 가져옵니다. Realtime 구독은 사용하지 않습니다.

브라우저에는 공개용 Supabase publishable key가 전달됩니다. 실제 접근 범위는 Supabase 권한과 RLS 정책으로 보호해야 합니다. 현재 실습 정책은 익명 사용자에게 일기 읽기·추가·삭제를 허용하므로, 민감한 개인 일기에 사용하기에는 안전하지 않습니다. 실제 서비스라면 사용자 로그인과 사용자별 RLS 정책을 추가하세요. Secret/service-role 키는 브라우저 코드에 넣지 않습니다.

## 배포

- GitHub Pages: [마음 한 페이지 열기](https://kimsihyeon07.github.io/26-w09-diary/)
- Netlify: 아직 배포하지 않았습니다.

GitHub Pages는 빌드된 `dist` 폴더를 `gh-pages` 브랜치에서 제공합니다. 소스 변경 후 `.env.local`이 준비된 상태로 `npm run build`를 실행하고, `npx gh-pages -d dist`로 배포할 수 있습니다.

## 구현 구조 및 확인

- `src/lib/supabase.js`: Supabase 클라이언트 초기화와 환경변수 검증
- `src/api/diaries.js`: 일기 조회, 추가, 삭제
- `src/App.jsx`: 감정 선택, 작성 폼, 필터, 목록, 상태 화면
- Tailwind CSS와 Vite 플러그인으로 반응형 스타일 구성

확인 명령:

- `npm run lint`
- `npm run build`
