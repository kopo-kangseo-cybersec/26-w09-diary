# 마음 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 여러 기기에서 확인하는 반응형 웹앱입니다. 감정별 필터와 작성·조회·삭제 기능을 제공합니다.

## 실행하기

1. Supabase 프로젝트의 URL과 publishable key를 `.env.local`에 설정합니다.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

2. 의존성을 설치하고 개발 서버를 실행합니다.

   ```bash
   npm install
   npm run dev
   ```

`diaries` 테이블은 미리 생성되어 있어야 하며 `id`, `content`, `emotion`, `created_at` 컬럼을 사용합니다. 일기 작성 및 삭제가 완료되면 목록을 다시 조회합니다. Supabase Realtime 구독은 사용하지 않습니다.

## 데이터와 보안

일기는 브라우저의 `localStorage`가 아니라 Supabase `diaries` 테이블에 저장되므로 같은 Supabase 프로젝트를 설정한 다른 기기에서도 조회할 수 있습니다. Supabase URL과 publishable key는 브라우저 앱에서 사용되는 값이며, 비밀 키로 취급하거나 보안 경계로 의존해서는 안 됩니다. 실제 데이터 접근 범위는 Supabase의 권한 설정과 RLS 정책으로 제한해야 합니다.

현재 앱에는 사용자 인증이 없으므로, RLS 정책이 공개 접근을 허용한다면 방문자가 같은 테이블의 일기를 읽거나 작성·삭제할 수 있습니다. 개인 일기 서비스로 운영하려면 인증을 추가하고 사용자별 정책으로 데이터를 보호해야 합니다.

## 기술 스택

- React, Vite
- Tailwind CSS
- Supabase JavaScript client
