# 마음 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 다른 기기에서도 확인하는 반응형 웹앱입니다.

## 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 오늘의 감정을 선택해 일기를 작성합니다.
- 작성 일시 최신순으로 기록을 확인하고 감정별로 모아볼 수 있습니다.
- 일기를 삭제할 수 있으며, 작성·삭제 후 목록을 다시 조회합니다.
- Supabase 연결이나 설정에 문제가 있으면 화면에 오류 안내를 표시합니다.

## 실행

1. 프로젝트 루트에 `.env.local` 파일을 만들고 Supabase 프로젝트 정보를 입력합니다.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

2. 의존성을 설치하고 개발 서버를 실행합니다.

   ```sh
   npm install
   npm run dev
   ```

`diaries` 테이블은 `id`, `content`, `emotion`, `created_at` 컬럼을 사용합니다. 브라우저에서 데이터에 접근할 수 있도록 Supabase의 RLS 정책과 권한을 올바르게 설정해야 합니다. Publishable key는 프런트엔드에서 사용되므로 비밀 키처럼 데이터를 보호하지 않습니다. 실제 접근 제어는 RLS 정책으로 적용하세요.

## 기술

React, Vite, Tailwind CSS, Supabase JavaScript client
