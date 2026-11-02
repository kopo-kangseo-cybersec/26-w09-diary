# 마음의 기록

하루의 감정과 생각을 남기는 레트로 감성 일기장입니다. Windows 95/98 스타일의 작업 표시줄과 창을 밤하늘·보라색 테마로 꾸몄으며, 기록은 Supabase에 저장되어 다른 기기에서도 확인할 수 있습니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 하나를 골라 일기를 작성하고 삭제합니다.
- 최신순 일기 목록에서 감정별로 기록을 모아볼 수 있습니다.
- 픽셀 아트 감정 아이콘, 드래그할 수 있는 창, 기능이 연결된 시작 메뉴를 제공합니다.
- 불안·화남 일기의 합계가 5개 이상이면 레트로 블루스크린을 표시합니다. `Esc` 키를 눌러 닫을 수 있습니다.
- 목록을 새로고침해 데이터를 다시 가져옵니다. Realtime 구독은 사용하지 않습니다.

## 시작하기

### 준비 사항

- Node.js와 npm
- Supabase 프로젝트와 `public.diaries` 테이블

테이블에는 `id`(bigint, 자동 생성), `content`(text), `emotion`(text), `created_at`(timestamptz, 기본값)가 필요합니다. `emotion`에는 `joy`, `calm`, `sad`, `angry`, `anxious` 값이 저장됩니다. 테이블 및 권한 설정은 [실습 가이드](./guide.md)의 Supabase 단계를 참고하세요.

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

일기는 브라우저의 로컬 저장소가 아니라 Supabase 데이터베이스에 저장됩니다. 현재 앱에는 로그인이나 사용자별 기록 분리가 없으므로, 실제로 누가 어떤 기록을 읽고 변경할 수 있는지는 Supabase의 권한과 RLS(Row Level Security) 정책에 달려 있습니다. 실습 가이드의 `using (true)` 정책은 누구나 기록을 읽거나 쓸 수 있는 데모용 설정이며, 개인 일기 서비스에는 적합하지 않습니다. 배포 전에는 인증과 사용자별 접근 정책을 구성하세요.

`VITE_SUPABASE_PUBLISHABLE_KEY`는 브라우저에서 사용되는 공개 키이므로 앱 빌드나 네트워크 요청에서 확인할 수 있습니다. 키를 숨기는 대신 RLS로 데이터 접근을 제한해야 합니다. `service_role` 또는 `sb_secret_...` 같은 비밀 키를 프런트엔드 환경변수에 넣거나 저장소에 커밋하지 마세요. `.env.local`은 Git에서 제외됩니다.

## 검증 명령

```bash
npm run lint
npm run build
```

## 문제 해결

- **환경변수 안내가 나타남:** `.env.local`의 변수명과 Supabase URL·publishable key를 확인하고 개발 서버를 다시 시작하세요.
- **테이블 권한 오류:** Supabase에서 `diaries` 테이블의 RLS 정책과 `anon` 역할의 권한을 확인하세요.
- **배포 후 설정이 반영되지 않음:** 호스팅 환경변수를 확인한 다음 새 빌드를 배포하세요.
