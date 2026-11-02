# 오늘의 감정 일기 🌷

하루의 감정과 생각을 포근한 종이 일기장에 적듯 기록하는 웹앱입니다. 일기는 Supabase에 저장되어 같은 프로젝트에 연결된 기기와 브라우저에서 확인할 수 있습니다.

## 주요 기능

- 기쁨·평온·슬픔·화남·불안 중 오늘의 감정을 선택해 일기 작성
- 작성 일시 기준 최신순으로 기록 확인
- 감정별 필터와 개별 기록 삭제
- 모바일과 데스크톱 화면에 맞춘 반응형 일기장 디자인
- 불러오기·저장 중 표시, 빈 목록 안내, 오류 메시지 제공
- 저장이나 삭제 후 목록을 다시 조회하는 기본 CRUD 방식 (Realtime 구독 없음)

## 시작하기

### 준비 사항

- Node.js와 npm
- Supabase 프로젝트와 `public.diaries` 테이블

### 설치 및 실행

1. 저장소를 내려받고 프로젝트 폴더에서 의존성을 설치합니다.

   ```sh
   npm install
   ```

2. 프로젝트 루트에 `.env.local` 파일을 만들고 Supabase 프로젝트의 URL과 Publishable Key를 입력합니다. `.env.example`을 참고할 수 있습니다.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

3. 개발 서버를 실행합니다.

   ```sh
   npm run dev
   ```

4. 터미널에 표시되는 로컬 주소를 브라우저에서 엽니다. 환경변수를 바꾼 뒤에는 개발 서버를 다시 시작하세요.

## 데이터베이스 설정

앱은 아래 구조의 `public.diaries` 테이블을 사용합니다. 테이블은 Supabase에서 미리 생성되어 있어야 합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `bigint` | 자동 생성되는 기본 키 |
| `content` | `text` | 일기 본문 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz` | 작성 시각, 기본값은 현재 시각 |

브라우저에서 Supabase API를 호출하므로 프로젝트의 권한과 RLS(Row Level Security) 정책이 `anon` 역할의 조회·추가·삭제 요청을 허용해야 합니다. 권한이나 정책이 맞지 않으면 앱에 요청 오류가 표시됩니다.

### 데이터 접근과 보안

- Supabase 클라이언트는 [`src/lib/supabase.js`](./src/lib/supabase.js)에서 초기화합니다.
- 조회·추가·삭제 요청은 [`src/api/diaries.js`](./src/api/diaries.js)에 모여 있습니다.
- Publishable Key는 브라우저에 전달되는 공개 키이므로 비밀 값처럼 취급할 수 없습니다. `service_role` 같은 비밀 키를 프런트엔드에 넣지 마세요.
- `.env.local`은 Git에 커밋하지 마세요. 배포할 때는 호스팅 서비스의 환경변수 설정에 같은 변수명을 등록해야 합니다.
- 로그인 기능이 없는 구성에서는 RLS 정책에 따라 다른 방문자도 일기를 읽거나 변경할 수 있습니다. 개인별 비공개 일기가 필요하다면 인증과 사용자별 RLS 정책을 추가해야 합니다.

## 프로젝트 명령

```sh
npm run dev      # 개발 서버
npm run lint     # 정적 검사
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 기술 스택

- React
- Vite
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
