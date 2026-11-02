# 오늘의 일기장

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 여러 기기에서 확인하는 감정 일기 웹앱입니다. React와 Vite로 만든 프론트엔드가 Supabase 데이터베이스와 직접 통신합니다.

> **주의:** 현재는 로그인 기능이 없고 읽기·쓰기·삭제를 누구에게나 허용하는 실습용 RLS 정책을 사용합니다. 실제 개인 일기나 민감한 정보를 기록하지 마세요.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 오늘의 감정을 선택해 일기 작성
- 일기를 최신순으로 확인하고 감정별로 필터링
- 작성한 일기 삭제
- 로딩, 저장 중, 빈 목록, 오류 상태 표시
- Supabase에 데이터를 저장해 새로고침하거나 다른 기기에서 접속해도 같은 기록 확인

일기 작성이나 삭제 후 목록을 다시 불러옵니다. Supabase Realtime 구독은 사용하지 않으므로 다른 탭이나 기기의 변경 사항을 보려면 새로고침해야 합니다.

## 기술 스택

- React 19, Vite 8
- Supabase JavaScript client
- CSS

## 시작하기

### 준비물

- Node.js와 npm
- Supabase 프로젝트

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 테이블 및 정책 설정

Supabase 대시보드의 **SQL Editor**에서 아래 SQL을 실행합니다. 이 정책은 인증 없이 누구나 모든 일기를 읽고, 추가하고, 삭제할 수 있게 합니다. **실습용으로만 사용하세요.**

```sql
create table public.diaries (
  id bigint primary key generated always as identity,
  content text not null,
  emotion text not null check (emotion in ('joy', 'calm', 'sad', 'angry', 'anxious')),
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.diaries to anon;
alter table public.diaries enable row level security;

create policy "anyone can read" on public.diaries
  for select to anon using (true);

create policy "anyone can insert" on public.diaries
  for insert to anon with check (true);

create policy "anyone can delete" on public.diaries
  for delete to anon using (true);
```

기존 프로젝트에서 이미 `diaries` 테이블과 정책을 만들었다면 SQL을 다시 실행하지 않아도 됩니다.

### 3. 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고, Supabase 대시보드의 Project URL과 **Publishable Key**를 입력합니다.

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://본인프로젝트.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_본인키
```

`VITE_` 환경변수는 브라우저용 빌드에 포함되어 사용자에게 공개됩니다. Publishable Key는 공개 사용을 전제로 하지만, 이것만으로 데이터가 보호되는 것은 아닙니다. 데이터 접근은 Supabase 권한과 RLS 정책으로 통제해야 합니다. `service_role` 또는 `sb_secret_` 키는 RLS를 우회할 수 있으므로 프론트엔드나 저장소에 넣지 마세요. `.env.local`은 Git에서 제외되지만, 배포할 때는 호스팅 플랫폼에도 같은 환경변수를 설정해야 합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

Vite가 출력하는 로컬 주소를 브라우저에서 엽니다.

## 빌드 및 배포

로컬에서 프로덕션 빌드를 만들고 확인합니다.

```bash
npm run build
npm run preview
```

빌드 결과물은 `dist/`에 생성됩니다.

- **Netlify:** 빌드 명령 `npm run build`, 게시 디렉터리 `dist`로 설정하고 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 환경변수로 등록합니다.
- **GitHub Pages:** `vite.config.js`의 상대 경로 설정(`base: './'`)은 Pages 배포를 지원합니다. 빌드한 `dist/`를 `gh-pages` 브랜치에 배포하고 저장소 Settings → Pages에서 해당 브랜치를 선택합니다. 배포 도구가 필요하면 `npx gh-pages -d dist`를 사용할 수 있습니다.

배포 주소:

- Netlify: 배포 후 주소를 추가하세요.
- GitHub Pages: 배포 후 주소를 추가하세요.

## 데이터 구조

`public.diaries` 테이블에 일기를 저장합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `bigint` | 자동 생성되는 기본 키 |
| `content` | `text` | 일기 내용 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz` | 생성 시각, 기본값은 `now()` |

8주차 To-Do처럼 브라우저의 `localStorage`에만 저장하면 해당 브라우저에 데이터가 남습니다. 이 앱은 Supabase 클라우드 데이터베이스를 사용하므로 같은 Supabase 프로젝트에 연결된 브라우저와 기기에서 기록을 공유합니다. 단, 현재 인증이 없기 때문에 접속한 사용자 간 데이터가 분리되지 않습니다.

## 보안 체크포인트

- `.env.local`을 Git에 커밋하지 않는 것은 키가 저장소 기록에 올라가는 것을 막기 위한 조치입니다. 프론트엔드 앱에서 사용하는 환경변수는 빌드 결과물과 브라우저 요청에서 확인할 수 있습니다.
- Publishable Key는 브라우저에서 사용하도록 설계된 공개 키입니다. 이를 비밀로 취급하는 대신, 최소 권한과 RLS 정책으로 데이터 접근을 제한해야 합니다.
- 현재 정책의 `using (true)` 및 `with check (true)`는 모든 익명 사용자가 모든 일기를 조회하고 추가 및 삭제할 수 있게 합니다. URL과 공개 키를 아는 누구나 API를 호출할 수 있으므로 개인 정보 보호가 되지 않습니다.
- 실제 서비스라면 Supabase Auth를 도입하고 `user_id` 컬럼을 추가한 뒤, 각 사용자가 자신의 행만 조회·추가·삭제하도록 RLS 정책을 설정해야 합니다. 비밀 키는 신뢰할 수 있는 서버 환경에서만 사용하세요.

## 구현 흐름

실습 가이드의 요구사항을 바탕으로 Copilot Plan 모드에서 구조와 작업 순서를 검토하고, Agent 모드에서 구현했습니다. Supabase 초기화는 `src/lib/supabase.js`, 데이터 조회·추가·삭제는 `src/api/diaries.js`에 분리했습니다. 이후 로컬에서 CRUD 동작과 새로고침 후 데이터 유지 여부를 확인하고, 브라우저 요청과 RLS 정책을 점검하는 흐름입니다.

자세한 단계별 실습 방법은 [`guide.md`](./guide.md)를 참고하세요.
