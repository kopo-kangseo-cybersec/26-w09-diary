# 📔 감정 일기 — React + Supabase (`26-w09-diary`)

하루의 감정과 생각을 기록하고, PC·스마트폰 등 **어느 기기에서 열어도 같은 일기**를 볼 수 있는 감정 일기장입니다.
실습 절차는 [`guide.md`](./guide.md)를 참고하세요.

## 소개

손글씨 노트 느낌의 아기자기한 디자인으로, 오늘의 기분을 고르고 일기를 남길 수 있어요.

- 😊 기쁨 · 😌 평온 · 😢 슬픔 · 😠 화남 · 😰 불안 중 감정을 선택해 일기 작성
- 최신순 카드 목록 (감정 이모지, 본문, 작성 날짜/시간, 삭제 버튼)
- 전체 / 감정별 모아보기 탭 필터
- 로딩 인디케이터, 저장 중 버튼 비활성화(중복 클릭 방지), 빈 상태 안내, 오류 안내 메시지
- 모바일·데스크톱 반응형 레이아웃

**기술 스택**: Vite · React · Tailwind CSS v4 · Supabase (`@supabase/supabase-js`)

## 시작하기

```bash
npm install
cp .env.example .env.local   # 값을 채워 넣기
npm run dev
```

`.env.local`

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint 검사 |

## 프로젝트 구조

```
src/
├─ lib/supabase.js    # Supabase 클라이언트 (유일한 생성 지점)
├─ api/diaries.js     # diaries 조회(select)·추가(insert)·삭제(delete)
├─ emotions.js        # 감정 목록(이모지·라벨·색상)
├─ App.jsx            # 화면 전체 (작성 / 필터 / 목록 / 상태 처리)
└─ index.css          # Tailwind + 줄 노트·마스킹 테이프 스타일
```

## 어떻게 만들었나요

1. Copilot **Plan 모드**에서 PRD를 바탕으로 구현 계획(Tailwind 설정 → Supabase 모듈 → UI → 템플릿 정리 → 검증)을 세웠습니다.
2. 계획 승인 후 **Agent**가 순서대로 구현했습니다. Vite 기본 예시 코드와 이미지는 정리했습니다.
3. `npm run build`로 빌드를 검증하고, 이후 디자인을 일기장 컨셉으로 개선했습니다.

Realtime(웹소켓)은 사용하지 않고, 작성·삭제 후 목록을 **다시 조회(fetch)** 하는 기본 CRUD 방식입니다.

## 데이터는 어디에 저장되나요

Supabase의 `diaries` 테이블에 저장됩니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint | 자동 생성 |
| `content` | text | 일기 본문 (필수) |
| `emotion` | text | `joy` / `calm` / `sad` / `angry` / `anxious` |
| `created_at` | timestamptz | 작성 일시 (DB 기본값) |

8주차 To-Do는 브라우저 `localStorage`에 저장해 **그 브라우저에서만** 보였지만, 감정 일기는 클라우드 DB에 저장하므로 다른 기기나 다른 브라우저에서 열어도 새로고침(재조회) 시 같은 기록이 보입니다. (실시간 자동 반영은 제외)

## 보안에서 확인한 것 (사이버보안과 체크포인트)

- **키 보관**: Supabase URL과 publishable 키는 `.env.local`에 두고, `.gitignore`로 GitHub에 올라가지 않게 했습니다. `.env.example`에는 자리표시자만 있습니다. RLS를 우회하는 `sb_secret_...` / `service_role` 키는 프론트엔드에 절대 쓰지 않습니다.
- **키 노출**: publishable 키는 브라우저 앱에서 쓰는 키라 빌드 파일과 Network 탭에서 보일 수밖에 없습니다. 따라서 키를 숨기는 것이 아니라, 데이터베이스의 **권한(`grant`)과 행 단위 보안(RLS) 정책**이 데이터를 지켜줍니다.
- **현재 RLS의 한계**: 실습용 정책(`using (true)`)은 **누구나 읽기·쓰기·삭제**를 허용합니다. 앱 주소와 키를 아는 사람은 모든 일기를 보거나 지울 수 있으므로, 개인 일기에는 부적합합니다. 실제 서비스라면 로그인(Supabase Auth)을 붙이고 `user_id` 기준(`auth.uid() = user_id`)으로 정책을 제한해야 합니다.

## 실행 및 배포 링크

- Netlify 배포 URL: (배포 후 입력)
- GitHub Pages 배포 URL: (배포 후 입력)

## 커스터마이징한 부분

- 손글씨 폰트(Gaegu, Jua), 줄 노트 배경, 마스킹 테이프, 약간 기울어진 카드로 실제 일기장 느낌 연출
- 감정별 파스텔 카드 색상과 선택 시 떠오르는 감정 버튼
- 일기장 말투의 로딩·빈 상태·오류 안내 문구
