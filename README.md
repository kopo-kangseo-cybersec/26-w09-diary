# 마음 일기 🌷

하루의 감정과 생각을 종이 일기장처럼 기록하는 반응형 웹앱입니다. 일기는 Supabase에 저장되므로 같은 프로젝트에 연결된 다른 기기와 브라우저에서도 확인할 수 있습니다.

## 주요 기능

- **감정 기록:** 기쁨, 평온, 슬픔, 화남, 불안 중 오늘의 감정을 고르고 일기를 작성합니다.
- **일기 모아보기:** 작성 일시 최신순으로 기록을 확인하고 감정별로 필터링할 수 있습니다.
- **기록 관리:** 일기를 삭제할 수 있습니다. 작성하거나 삭제한 뒤에는 목록을 다시 조회합니다.
- **반응형 화면:** 모바일과 데스크톱에서 사용할 수 있는 따뜻한 종이 일기장 디자인을 적용했습니다.
- **상태 안내:** 목록을 불러오는 동안 로딩 상태를 표시하고, 빈 목록과 Supabase 오류를 구분해 안내합니다.

## 시작하기

### 준비물

- Node.js와 npm
- Supabase 프로젝트와 `diaries` 테이블

### 설치 및 실행

1. 저장소를 내려받고 프로젝트 폴더에서 의존성을 설치합니다.

   ```sh
   npm install
   ```

2. 프로젝트 루트의 `.env.example`을 복사해 `.env.local` 파일을 만들고, Supabase 프로젝트 정보를 입력합니다.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

   Supabase 대시보드의 프로젝트 URL과 **Publishable key**를 사용하세요. `.env.local`은 Git에서 제외됩니다. 환경 변수를 변경했다면 개발 서버를 다시 시작해야 합니다.

3. 개발 서버를 실행합니다.

   ```sh
   npm run dev
   ```

   터미널에 표시되는 로컬 주소를 브라우저에서 엽니다.

## Supabase 데이터

앱은 Supabase의 `public.diaries` 테이블에 다음 컬럼이 있다고 가정합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `bigint` | 자동 생성되는 일기 ID |
| `content` | `text` | 일기 본문 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz` | 작성 일시, 데이터베이스 기본값 사용 |

테이블 생성, 권한 부여, RLS 설정 절차와 SQL은 [`guide.md`](./guide.md)의 Supabase 설정 단계를 참고하세요. 앱은 목록 조회·일기 추가·일기 삭제에 필요한 권한과 정책을 사용합니다.

### 보안 및 개인정보

Supabase Publishable key는 브라우저 앱에서 사용되므로 사용자에게 공개됩니다. 이 키 자체는 비밀이 아니며, 데이터 접근은 **RLS 정책**으로 제한해야 합니다. 현재 가이드의 `anon` 대상 `using (true)` / `with check (true)` 정책은 로그인 없이 누구나 일기를 읽고 추가·삭제할 수 있도록 허용하는 실습용 설정입니다. 따라서 이 설정으로는 개인 일기가 보호되지 않으며, 데이터를 공유하는 모든 사용자가 같은 테이블을 보게 됩니다.

실제 개인 기록을 저장하려면 Supabase Auth를 추가하고, RLS 정책에서 인증된 사용자의 소유 기록만 조회·추가·삭제하도록 구성하세요. `service_role` 키나 데이터베이스 비밀번호를 브라우저 코드 또는 `VITE_` 환경 변수에 넣지 마세요. 민감한 개인정보는 실습용 공개 정책이 설정된 프로젝트에 저장하지 마세요.

## 동기화 방식

일기는 서버 데이터베이스에 저장됩니다. 다른 기기에서도 같은 Supabase 프로젝트와 테이블을 사용하면 새로고침 또는 다시 조회한 뒤 같은 기록을 확인할 수 있습니다. 이 앱은 **Supabase Realtime을 사용하지 않으며**, 작성·삭제 이후 목록을 다시 불러옵니다.

## 개발 명령

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 실행 |
| `npm run lint` | Oxlint로 코드 검사 |
| `npm run build` | 배포용 파일을 `dist/`에 빌드 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |

## 프로젝트 구조

```text
src/
├── api/diaries.js       # 일기 조회·추가·삭제
├── lib/supabase.js      # Supabase 클라이언트 초기화
├── App.jsx              # 일기 작성, 필터, 목록 UI
├── index.css            # Tailwind CSS와 전역·일기장 스타일
└── main.jsx             # React 앱 진입점
```

### 기술 스택

React · Vite · Tailwind CSS · Supabase JavaScript client
