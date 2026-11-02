# 감정 일기 — 마음 한 페이지

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 감정별로 모아보는 반응형 웹앱입니다. 일기 작성과 삭제 후에는 목록을 다시 조회하며, Realtime 구독은 사용하지 않습니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 감정으로 일기 작성
- 최신순 일기 목록과 감정별 필터
- 로딩, 저장 중, 빈 목록, 연결 오류 상태 안내
- 모바일과 데스크톱 화면 지원

## 시작하기

1. 의존성을 설치합니다: `npm install`
2. `.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트의 URL과 publishable key를 입력합니다.
3. 개발 서버를 실행합니다: `npm run dev`

`.env.local`은 Git에 포함하지 마세요. 데이터베이스의 `diaries` 테이블과 앱에서 사용하는 읽기·추가·삭제 권한 정책이 Supabase에 설정되어 있어야 합니다. 자세한 설정은 [`guide.md`](./guide.md)를 참고하세요.

## 구현 구조

- `src/lib/supabase.js`: Supabase 클라이언트 초기화와 환경변수 검증
- `src/api/diaries.js`: 일기 조회, 추가, 삭제 요청
- `src/App.jsx`: 감정 선택, 작성 폼, 필터, 목록, 상태 안내
- Tailwind CSS와 Vite 플러그인으로 반응형 스타일 구성

## 확인

- `npm run lint`
- `npm run build`
