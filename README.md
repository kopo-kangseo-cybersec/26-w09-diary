# 마음 기록 — 감정 일기

하루의 감정과 생각을 기록하는 반응형 웹앱입니다. 일기는 Supabase에 저장되므로 같은 프로젝트를 사용하는 PC와 스마트폰에서 확인할 수 있습니다.

## 주요 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 하나를 골라 일기 작성
- 작성한 일기를 최신순으로 확인하고 삭제
- 전체 일기 또는 감정별 필터로 모아보기
- 목록을 불러오는 동안 로딩 표시, 데이터가 없을 때 안내, 요청 실패 시 오류와 재시도 표시
- 새로고침하거나 일기를 작성·삭제할 때 데이터 재조회

> 로그인 및 사용자별 데이터 분리는 구현되어 있지 않습니다. Supabase Realtime 구독도 사용하지 않습니다.

## 시작하기

### 준비 사항

- Node.js가 설치된 개발 환경
- `diaries` 테이블과 API 접근 정책이 설정된 Supabase 프로젝트

### Supabase 설정

프로젝트 루트에서 `.env.example`을 `.env.local`로 복사한 뒤 Supabase 프로젝트의 URL과 Publishable Key를 입력합니다.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

`.env.local`은 Git에 포함하지 마세요. 설정이 비어 있으면 앱에 안내가 표시됩니다. 환경 변수를 변경했다면 개발 서버를 재시작하세요.

### 설치 및 실행

```sh
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 엽니다.

## 데이터베이스

앱은 이미 준비된 Supabase `public.diaries` 테이블을 사용합니다.

| 컬럼 | 용도 |
| --- | --- |
| `id` | 자동 생성되는 일기 식별자 |
| `content` | 일기 본문 |
| `emotion` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | 데이터베이스에서 설정하는 작성 시각 |

브라우저 앱이 테이블에 접근하려면 Supabase 권한과 RLS 정책에서 필요한 작업을 허용해야 합니다. 테이블이나 정책이 아직 없다면 [`guide.md`](./guide.md)의 SQL 설정 안내를 참고하세요. 앱은 목록 조회 시 `created_at` 내림차순으로 정렬합니다.

## 보안 및 데이터 접근 범위

현재 앱은 로그인 없이 Supabase `anon` 역할로 접근합니다. 프로젝트의 RLS 정책이 익명 사용자 모두에게 읽기·추가·삭제를 허용한다면, 데이터는 같은 Supabase 프로젝트를 이용하는 모든 방문자와 공유되며 누구나 삭제할 수 있습니다. 이 구성은 실습용이며 개인 일기나 민감한 정보를 보호하지 않습니다.

`VITE_` 환경 변수와 Supabase Publishable Key는 브라우저에 전달되므로 비밀 정보가 아닙니다. 키를 숨기는 것만으로 데이터가 보호되지는 않습니다. 실제 서비스에서는 인증과 사용자별 RLS 정책을 구성하고, 각 사용자가 자신의 일기만 읽고 수정·삭제할 수 있도록 권한을 제한하세요. 서비스 역할 키 등 서버 전용 비밀 키를 브라우저 코드에 넣지 마세요.

## 검사 및 배포 빌드

```sh
npm run lint
npm run build
npm run preview
```

배포 환경에서도 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`를 빌드 환경 변수로 설정한 뒤 다시 빌드해야 합니다.

## 프로젝트 구조

```text
src/
├── api/diaries.js       # 일기 조회, 추가, 삭제
├── lib/supabase.js      # Supabase 클라이언트 초기화
├── App.jsx              # 일기 작성과 목록 UI
└── index.css            # Tailwind CSS 및 전역 스타일
```
