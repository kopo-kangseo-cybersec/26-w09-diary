# 마음 한 페이지

하루의 감정과 생각을 종이 일기장처럼 기록하는 반응형 감정 일기 웹앱입니다. 일기는 브라우저가 아닌 Supabase 데이터베이스에 저장되므로, 같은 Supabase 프로젝트에 연결된 앱을 다른 기기에서 열어도 다시 조회해 기록을 확인할 수 있습니다.

> **데이터 공개 범위 안내:** 이 프로젝트의 실습용 RLS 정책은 인증 없이 누구나 일기를 읽고, 작성하고, 삭제할 수 있도록 설정되어 있습니다. 따라서 이 앱에 입력한 내용은 비밀 일기가 아닙니다. 실제 개인정보를 기록하지 마세요. 비공개 서비스로 운영하려면 로그인, 사용자별 소유자 컬럼, `auth.uid()` 기반 RLS 정책을 먼저 적용해야 합니다.

## 주요 기능

- 기쁨 😊 · 평온 😌 · 슬픔 😢 · 화남 😠 · 불안 😰 중 하나를 골라 일기 작성
- 작성 일시 기준 최신순 기록 목록
- 전체 기록 또는 감정별 모아보기
- 삭제 확인 후 기록 삭제
- 로딩, 저장 중, 빈 목록, 연결 오류 안내
- 모바일과 데스크톱 화면에 맞는 종이 일기장 디자인
- 작성·삭제 뒤 데이터베이스를 다시 조회해 변경 사항 반영

앱은 Supabase Realtime을 사용하지 않습니다. 다른 기기에서 작성한 일기는 페이지를 새로고침하거나 목록의 **다시 펼쳐보기**를 눌러 확인할 수 있습니다.

## 기술 구성

- React 19, Vite 8
- Tailwind CSS 4
- Supabase JavaScript client
- Supabase `public.diaries` 테이블

## 시작하기

### 준비 사항

- Node.js와 npm
- Supabase 프로젝트 및 `public.diaries` 테이블

테이블 생성, 권한 설정, 환경변수 등록은 [실습 및 배포 가이드](./guide.md)를 참고하세요. 테이블은 다음 컬럼을 사용합니다.

| 컬럼 | 타입 및 규칙 | 설명 |
| --- | --- | --- |
| `id` | `bigint`, 자동 생성 | 일기 식별자 |
| `content` | `text`, 필수 | 일기 본문 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz`, DB 기본값 | 작성 일시 |

### 로컬 실행

```bash
npm install
cp .env.example .env.local
```

`.env.local`에 Supabase 프로젝트 URL과 **Publishable key**를 입력합니다.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

그다음 개발 서버를 실행합니다.

```bash
npm run dev
```

환경변수를 바꾼 뒤에는 개발 서버를 재시작하세요. 값이 없거나 URL 형식이 올바르지 않으면 앱에 설정 오류가 표시됩니다.

### 유용한 명령

```bash
npm run dev      # 로컬 개발 서버
npm run lint     # Oxlint 검사
npm run build    # dist/에 프로덕션 빌드
npm run preview  # 프로덕션 빌드 미리보기
```

## 프로젝트 구조

```text
src/
├── api/
│   └── diaries.js      # 일기 select / insert / delete
├── lib/
│   └── supabase.js     # Supabase 클라이언트와 환경변수 확인
├── App.jsx             # 작성 폼, 필터, 일기 목록 및 상태 UI
├── index.css           # Tailwind 및 종이 일기장 디자인
└── main.jsx            # React 앱 진입점
```

## 배포

정적 배포 전 프로덕션 빌드를 생성합니다.

```bash
npm run build
```

생성된 `dist/` 디렉터리를 Netlify 또는 GitHub Pages에 배포할 수 있습니다. 배포 환경에도 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`를 등록한 뒤 다시 빌드해야 합니다. GitHub Pages의 빌드 방식과 단계별 배포 방법은 [가이드](./guide.md)를 참고하세요.

## 보안 참고

- 브라우저에서 사용하는 `VITE_SUPABASE_PUBLISHABLE_KEY`는 빌드 결과물에서 보일 수 있는 공개 키입니다. 이를 비밀로 취급해 접근을 보호할 수는 없습니다.
- `service_role` 또는 `sb_secret_...` 키는 RLS를 우회할 수 있으므로 프런트엔드나 `VITE_` 환경변수에 절대 넣지 마세요.
- 데이터 접근 권한은 Supabase 권한 부여와 RLS 정책이 통제합니다. 이 저장소 가이드의 `using (true)` 정책은 실습을 위한 공개 정책이며, 누구나 모든 일기를 읽고 삭제할 수 있습니다.
- `.env.local`은 Git에 커밋되지 않도록 `.gitignore`에 포함되어 있습니다. 공개 키만 사용하더라도 환경변수 파일은 저장소에 올리지 마세요.
