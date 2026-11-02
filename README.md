# 마음의 페이지

오늘의 감정과 생각을 적어 두는 반응형 온라인 일기장입니다. 기록은 브라우저 로컬 저장소가 아닌 Supabase에 저장되므로, 같은 프로젝트에 연결된 다른 기기와 브라우저에서도 확인할 수 있습니다.

화면은 줄노트와 감정별 메모를 떠올리는 디자인으로 구성했습니다. 감정을 고르고 글을 남긴 뒤, 날짜순으로 모아 보거나 감정별로 살펴볼 수 있습니다.

## 기능

- 기쁨, 평온, 슬픔, 화남, 불안 중 오늘의 감정 선택
- 일기 작성 및 삭제
- 최신 작성순 목록과 감정별 필터
- 조회 중, 저장 중, 빈 목록, 연결 오류 상태 안내
- 모바일과 데스크톱에 대응하는 Tailwind CSS 레이아웃
- 저장이나 삭제 후 목록 재조회. Supabase Realtime 구독은 사용하지 않음

## 시작하기

Node.js와 npm이 설치되어 있어야 합니다.

1. 의존성을 설치합니다.

	```bash
	npm install
	```

2. 예시 환경 파일을 로컬 설정 파일로 복사합니다.

	```bash
	cp .env.example .env.local
	```

3. `.env.local`에 Supabase 프로젝트의 URL과 Publishable Key를 입력합니다.

	```dotenv
	VITE_SUPABASE_URL=https://your-project.supabase.co
	VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
	```

4. 개발 서버를 실행합니다.

	```bash
	npm run dev
	```

환경 변수 변경 후에는 개발 서버를 다시 시작하세요. `.env.local`은 Git에서 제외됩니다. Supabase 테이블과 키를 준비하는 자세한 절차는 [실습 가이드](guide.md)를 참고하세요.

## 데이터와 구조

일기는 Supabase `diaries` 테이블에 저장됩니다.

| 컬럼 | 설명 |
| --- | --- |
| `id` | 자동 생성되는 일기 식별자 |
| `content` | 일기 본문 |
| `emotion` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | 데이터베이스가 기록하는 작성 시각 |

데이터 접근은 화면에서 분리되어 있습니다.

- `src/lib/supabase.js`: 환경 변수 검증 및 Supabase 클라이언트 초기화
- `src/api/diaries.js`: 목록 조회, 일기 추가, 일기 삭제
- `src/App.jsx`: 감정 선택, 작성 폼, 필터, 목록 및 화면 상태
- `src/base.css`, `src/journal.css`: Tailwind 진입점과 일기장 스타일

## 보안 및 공개 범위

이 프로젝트의 현재 RLS 정책은 익명 사용자에게 모든 행의 조회·추가·삭제를 허용하는 실습용 설정입니다. 사이트에 접속할 수 있는 사람은 누구나 기록을 읽거나 삭제할 수 있으므로, 비공개 일기나 민감한 내용을 저장하지 마세요.

`VITE_SUPABASE_PUBLISHABLE_KEY`는 브라우저에서 사용하는 공개 키이며, 빌드된 앱에서도 확인할 수 있습니다. 데이터 접근을 제한하는 보안 경계는 키를 숨기는 것이 아니라 Supabase의 RLS 정책입니다. `service_role` 또는 Secret Key를 프런트엔드 환경 변수로 사용하지 마세요. 사용자별 비공개 기록이 필요하다면 인증과 사용자별 RLS 정책을 먼저 설계해야 합니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 로컬 개발 서버 실행 |
| `npm run lint` | 정적 분석 실행 |
| `npm run build` | 배포용 파일을 `dist/`에 생성 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |

배포 절차와 Supabase 설정은 [guide.md](guide.md)에 정리되어 있습니다.
