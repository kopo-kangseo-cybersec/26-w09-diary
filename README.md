# 마음 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 여러 기기에서 확인하는 반응형 웹앱입니다. 분홍색 테마와 감정별 필터를 제공하며 일기 작성·조회·삭제를 지원합니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안, 졸림 중 감정을 선택해 기록
- 최신순 일기 목록 및 감정별 필터
- Supabase에 기록 저장, 삭제 후 목록 재조회
- 모바일과 데스크톱에 대응하는 반응형 화면

## 일기 작성하기

1. 감정 버튼 하나를 선택합니다.
2. 일기 내용을 입력합니다. 공백만 입력한 경우에는 저장할 수 없습니다.
3. **일기 저장하기**를 누르고 저장이 완료될 때까지 기다립니다.

감정과 내용이 모두 입력되어야 저장 버튼이 활성화됩니다.

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

`diaries` 테이블은 미리 생성되어 있어야 하며 `id`, `content`, `emotion`, `created_at` 컬럼을 사용합니다. 감정 값은 `joy`, `calm`, `sad`, `angry`, `anxious`, `sleepy`입니다. 테이블 생성 및 RLS 권한 설정 SQL은 [guide.md](./guide.md)를 참고하세요. 기존 테이블을 사용한다면 같은 안내서의 감정 제약 갱신 SQL을 Supabase에서 한 번 실행해야 `졸림` 감정을 저장할 수 있습니다. 일기 작성 및 삭제가 완료되면 목록을 다시 조회합니다. Supabase Realtime 구독은 사용하지 않습니다.

## 저장이 되지 않을 때

- 저장 버튼이 비활성화되어 있으면 감정 선택과 일기 내용 입력을 모두 완료했는지 확인하세요.
- 화면에 Supabase 설정 오류가 표시되면 `.env.local`의 `VITE_SUPABASE_URL` 및 `VITE_SUPABASE_PUBLISHABLE_KEY`를 확인하고 개발 서버를 다시 시작하세요.
- `permission denied for table diaries` 오류가 표시되면 Supabase에서 `diaries` 테이블 권한과 RLS 정책을 확인하세요.
- `new row violates check constraint` 오류가 표시되면 테이블의 감정 제약이 현재 감정 값과 일치하는지 확인하세요. 기존 테이블은 [guide.md](./guide.md)의 제약 갱신 SQL을 실행해야 할 수 있습니다.

## 데이터와 보안

일기는 브라우저의 `localStorage`가 아니라 Supabase `diaries` 테이블에 저장되므로 같은 Supabase 프로젝트를 설정한 다른 기기에서도 조회할 수 있습니다. Supabase URL과 publishable key는 브라우저 앱에서 사용되는 값이며, 비밀 키로 취급하거나 보안 경계로 의존해서는 안 됩니다. 실제 데이터 접근 범위는 Supabase의 권한 설정과 RLS 정책으로 제한해야 합니다.

현재 앱에는 사용자 인증이 없으므로, RLS 정책이 공개 접근을 허용한다면 방문자가 같은 테이블의 일기를 읽거나 작성·삭제할 수 있습니다. 개인 일기 서비스로 운영하려면 인증을 추가하고 사용자별 정책으로 데이터를 보호해야 합니다.

## 기술 스택

- React, Vite
- Tailwind CSS
- Supabase JavaScript client
