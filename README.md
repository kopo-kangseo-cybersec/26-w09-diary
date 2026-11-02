# 감정 일기 — React + Supabase (`26-w09-diary`)

> 이 README는 실습을 완성한 뒤, 배포 직전 단계에서 직접 채워 넣습니다.
> 자세한 실습 절차는 [`guide.md`](./guide.md)를 참고하세요.

## 소개

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 다른 기기에서도 확인하는 반응형 감정 일기입니다. 감정별 필터와 일기 삭제를 지원하며, 작성·삭제 뒤에는 목록을 다시 조회합니다.

## 어떻게 만들었나요

Vite와 React로 화면을 구성하고, Tailwind CSS로 모바일·데스크톱 레이아웃을 스타일링했습니다. Supabase 클라이언트는 `src/lib/supabase.js`에서 초기화하며, `src/api/diaries.js`에서 목록 조회·추가·삭제를 담당합니다. Realtime 구독 없이 기본 CRUD 방식으로 동작합니다.

## 데이터는 어디에 저장되나요

기록은 Supabase `diaries` 테이블의 `id`, `content`, `emotion`, `created_at` 컬럼에 저장됩니다. 브라우저의 `localStorage`가 아니라 온라인 데이터베이스를 사용하므로, 같은 Supabase 프로젝트에 연결된 앱을 열면 기기와 브라우저가 달라도 같은 기록을 확인할 수 있습니다.

## 보안에서 확인한 것 (사이버보안과 체크포인트)

로컬 Supabase 설정은 `.env.local`에 두며 이 파일은 Git에서 제외됩니다. `VITE_` 환경변수는 브라우저 앱에서 사용되므로 비밀값이 아닙니다. 실제 접근 통제는 Supabase의 RLS 정책과 권한 설정이 담당해야 합니다. 현재 사용자 인증 없이 누구나 읽기·쓰기·삭제를 허용하는 정책은 실습용이며, 공개 서비스에서는 사용자별 인증과 행 단위 정책으로 변경해야 합니다.

## 로컬 실행

1. `.env.example`을 참고해 `.env.local`을 만들고 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 설정합니다.
2. `npm install`을 실행합니다.
3. `npm run dev`로 개발 서버를 시작합니다.
4. `npm run build`로 배포용 빌드를 확인합니다.

## 실행 및 배포 링크

- Netlify 배포 URL: 
- GitHub Pages 배포 URL: 

## 커스터마이징한 부분

<!-- 기본 요구사항 외에 직접 추가하거나 바꾼 부분이 있다면 적어주세요 (예: 삭제 확인 창, 감정별 통계 등) -->
