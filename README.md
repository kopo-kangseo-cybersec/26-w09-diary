# 마음의 기록

하루의 감정과 생각을 남기는 레트로 감성 일기장입니다. Windows 95/98 스타일의 작업 표시줄과 창을 밤하늘·보라색 테마로 꾸몄으며, 계정별 일기를 Supabase에 안전하게 저장합니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 하나를 골라 일기를 작성하고 삭제합니다.
- 이메일 계정을 만들고 로그인할 수 있으며, 개인 사용자는 본인이 쓴 일기만 볼 수 있습니다.
- 관리자는 전체 사용자의 일기를 확인하고 삭제할 수 있습니다.
- 최신순 일기 목록에서 감정별로 기록을 모아볼 수 있습니다.
- 픽셀 아트 감정 아이콘, 드래그할 수 있는 창, 기능이 연결된 시작 메뉴를 제공합니다.
- 불안·화남 일기의 합계가 5개 이상이면 레트로 블루스크린을 표시합니다. `Esc` 키를 눌러 닫을 수 있습니다.
- 목록을 새로고침해 데이터를 다시 가져옵니다. Realtime 구독은 사용하지 않습니다.

## 시작하기

### 준비 사항

- Node.js와 npm
- Supabase 프로젝트

Supabase SQL Editor에서 [기본 보안 마이그레이션](./supabase/migrations/20261102000000_diary_account_security.sql)과 [관리자 이메일 조회 마이그레이션](./supabase/migrations/20261102000100_admin_diary_emails.sql)을 순서대로 실행해 테이블, 계정 프로필, 권한 및 RLS 정책을 설정하세요. 기본 보안 마이그레이션을 이미 실행했다면 두 번째 파일만 실행하면 됩니다. 기존 익명 일기는 사용자 소유자가 정해져 있지 않으므로 일반 계정에 표시되지 않으며 관리자만 볼 수 있습니다.

Supabase 프로젝트에서 이메일 확인 기능이 켜져 있으면 가입 확인 메일의 링크를 누른 다음 로그인해야 합니다.

### 로컬 실행

1. 저장소를 내려받고 의존성을 설치합니다.

   ```bash
   npm install
   ```

2. 프로젝트 루트의 `.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트 정보를 입력합니다.

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

3. 개발 서버를 실행합니다.

   ```bash
   npm run dev
   ```

환경변수를 변경했다면 개발 서버를 다시 시작하세요. 배포할 때는 호스팅 서비스의 환경변수 설정에 같은 두 변수를 등록한 뒤 다시 빌드해야 합니다.

## 사용 기술

- React 19, Vite
- Tailwind CSS 4
- Supabase JavaScript client

Supabase 클라이언트는 [`src/lib/supabase.js`](./src/lib/supabase.js)에서 초기화하고, 일기 조회·추가·삭제는 [`src/api/diaries.js`](./src/api/diaries.js)에 모았습니다.

## 데이터와 보안

일기는 Supabase Auth 계정에 연결되어 저장됩니다. `diaries.user_id`는 인증된 사용자 ID로 DB에서 설정되며, RLS 정책은 개인 사용자에게 본인 행만 허용하고 `profiles.role = 'admin'`인 관리자에게 모든 행을 허용합니다. 관리자에게만 허용되는 DB 함수가 일기와 작성자 이메일을 반환합니다. 계정 가입으로 관리자 권한을 지정할 수 없으며, 관리자는 Supabase SQL Editor에서 직접 지정해야 합니다. 가입 후 아래 SQL의 이메일을 관리자로 승격할 계정 이메일로 바꾸어 실행하세요.

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'admin@example.com'
);
```

앱은 Supabase Auth SDK를 사용하고, 데이터 쿼리는 Supabase의 구조화된 쿼리 빌더를 사용합니다. 사용자 입력을 SQL 문자열로 이어 붙이지 않습니다. 실제 데이터 보호는 클라이언트 검사에 의존하지 않고 DB 권한과 RLS 정책에서 강제됩니다.

`VITE_SUPABASE_PUBLISHABLE_KEY`는 브라우저에서 사용되는 공개 키이므로 앱 빌드나 네트워크 요청에서 확인할 수 있습니다. 키를 숨기는 대신 RLS로 데이터 접근을 제한해야 합니다. `service_role` 또는 `sb_secret_...` 같은 비밀 키를 프런트엔드 환경변수에 넣거나 저장소에 커밋하지 마세요. `.env.local`은 Git에서 제외됩니다.

## 검증 명령

```bash
npm run lint
npm run build
```

## 문제 해결

- **환경변수 안내가 나타남:** `.env.local`의 변수명과 Supabase URL·publishable key를 확인하고 개발 서버를 다시 시작하세요.
- **테이블 권한 오류:** Supabase SQL Editor에서 보안 마이그레이션이 성공했는지 확인하고, 로그인한 사용자의 계정과 `authenticated` 권한을 확인하세요.
- **배포 후 설정이 반영되지 않음:** 호스팅 환경변수를 확인한 다음 새 빌드를 배포하세요.

## 실행 및 배포 링크
- github : https://taeyoon-hack.github.io/26-w09-diary/
- netlify : https://ty-diary.netlify.app/