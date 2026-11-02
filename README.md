# 오늘의 감정 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 여러 기기에서 확인하는 반응형 웹앱입니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 감정과 함께 일기 작성
- 최신순 일기 목록, 감정별 필터, 일기 삭제
- Supabase `diaries` 테이블을 사용하는 기본 CRUD 연동
- 저장·조회·삭제가 끝나면 목록을 다시 가져오며 Realtime 구독은 사용하지 않습니다.

## 실행

1. 의존성을 설치합니다.

   ```sh
   npm install
   ```

2. `.env.example`을 참고해 프로젝트 루트에 `.env.local`을 만들고 Supabase 접속 정보를 설정합니다.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

3. 개발 서버를 실행합니다.

   ```sh
   npm run dev
   ```

## 데이터베이스

앱은 이미 생성된 `public.diaries` 테이블의 `id`, `content`, `emotion`, `created_at` 컬럼을 사용합니다. 브라우저에서 Supabase에 직접 연결하므로 프로젝트에서 `anon` 역할의 select, insert, delete 권한과 적절한 RLS 정책을 설정해야 합니다.

Publishable Key는 브라우저 앱에서 사용하도록 만들어진 공개 키이며 사용자 데이터 보호를 대신하지 않습니다. `.env.local`은 Git에 커밋하지 말고, 실제 접근 제어는 Supabase RLS 정책으로 구성하세요.

## 검증

```sh
npm run lint
npm run build
```
