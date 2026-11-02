# 감정 일기 — React + Supabase

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 여러 기기에서 확인하는 반응형 웹앱입니다. 감정을 선택해 기록을 분류하고, 감정별로 모아보거나 확인 후 삭제할 수 있습니다. 데이터 변경 후 목록을 다시 조회하며 Realtime 구독은 사용하지 않습니다.

## 실행하기

1. Supabase 프로젝트에 `id`, `content`, `emotion`, `created_at` 컬럼이 있는 `diaries` 테이블을 준비합니다.
2. `.env.example`을 참고해 프로젝트 루트에 `.env.local` 파일을 만들고 Supabase 프로젝트 URL과 publishable key를 설정합니다.
3. 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

`.env.local` 값을 바꾼 뒤에는 Vite 개발 서버를 다시 시작하세요. 환경변수 또는 네트워크 설정이 잘못되면 앱에서 오류 안내를 표시합니다.

## 기술 구성

- Vite, React, Tailwind CSS
- Supabase JavaScript client
- Supabase `diaries` 테이블을 통한 목록 조회, 추가, 삭제

## 데이터와 보안

일기는 브라우저의 로컬 저장소가 아닌 Supabase `diaries` 테이블에 저장됩니다. 따라서 테이블 권한 정책이 허용하는 범위 안에서 다른 브라우저와 기기에서도 같은 기록을 확인할 수 있습니다. 현재 앱은 로그인 기능을 제공하지 않으며, 실제 데이터 접근 범위는 Supabase의 RLS 정책에 달려 있습니다.

`VITE_SUPABASE_PUBLISHABLE_KEY`는 브라우저 앱에서 사용되는 공개 가능한 키라 빌드 결과와 네트워크 요청에서 확인할 수 있습니다. 이 키 자체를 비밀로 취급하지 말고, 접근 제어는 RLS 정책으로 설정하세요. `service_role` 같은 비밀 키를 클라이언트 환경변수에 넣지 마세요. 특히 모든 사용자에게 읽기·쓰기·삭제를 허용하는 정책은 일기 데이터 보호에 적합하지 않습니다.

## 프로젝트 안내

수업 실습 단계와 Supabase 설정 안내는 [`guide.md`](./guide.md)를 참고하세요.
