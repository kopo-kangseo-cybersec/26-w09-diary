# 마음 한 페이지 — 감정 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 PC와 스마트폰 등 여러 기기에서 확인하는 반응형 웹앱입니다.

## 기능

- 다섯 가지 감정(기쁨, 평온, 슬픔, 화남, 불안)을 선택해 일기 작성
- 최신순 일기 목록과 감정별 필터
- 삭제 확인 후 일기 삭제
- 로딩, 저장 중, 빈 목록, 연결/요청 오류 상태 안내
- 작성과 삭제 뒤 Supabase에서 목록을 다시 조회합니다. Realtime 구독은 사용하지 않습니다.

## 실행

1. 의존성을 설치합니다: `npm install`
2. `.env.example`을 참고해 `.env.local` 파일을 만들고 Supabase 프로젝트 값을 입력합니다.

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

3. 개발 서버를 실행합니다: `npm run dev`
4. 배포용 빌드는 `npm run build`로 생성합니다.

브라우저에서 사용하는 키는 Supabase publishable key여야 합니다. `service_role` 또는 secret 키를 프런트엔드에 넣지 마세요. 브라우저에 publishable key가 포함되는 앱에서는 Supabase의 RLS 정책이 데이터 접근 권한을 결정합니다. `.env.local`은 Git에 커밋되지 않습니다.

## 데이터

앱은 이미 생성된 `public.diaries` 테이블을 사용합니다.

| 컬럼 | 용도 |
| --- | --- |
| `id` | 자동 생성 식별자 |
| `content` | 일기 본문 |
| `emotion` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | 데이터베이스가 지정하는 작성 시각 |

여러 기기 간 데이터 동기화는 공용 Supabase 데이터베이스를 다시 조회하는 방식입니다. 로그인이나 실시간 동기화는 포함하지 않습니다.

## 실습 및 배포 안내

Supabase 테이블, RLS 설정, 네트워크 확인, 배포 관련 상세 안내는 [`guide.md`](./guide.md)를 참고하세요.

- Netlify 배포 URL:
- GitHub Pages 배포 URL:
