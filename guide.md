# guide.md — 감정 일기 (`26-w09-diary`)

> 이 문서는 실습 중 계속 펴놓고 따라가는 매뉴얼입니다.
> 수업 시간(총 130분) 내에 배포와 제출까지 깔끔하게 완료할 수 있도록 단계별로 구성되어 있습니다.

---

## 왜 오늘은 "처음부터 서버에 저장"하나요

8주차 To-Do 리스트는 브라우저의 `localStorage`에 저장했기 때문에, 다른 컴퓨터나 내 스마트폰에서 열면 목록이 텅 비어 있었습니다.
오늘은 처음부터 **데이터를 Supabase(온라인 클라우드 데이터베이스)에 저장**하는 감정 일기를 만듭니다.
그래서 순서도 완전히 달라집니다 — 화면 디자인보다 **데이터 구조(SQL)를 먼저 정의**하고 개발을 시작합니다.

---

## ⏱️ 오늘의 수업 타임라인 (총 130분)

수업 시간 내에 배포와 제출까지 마칠 수 있도록 시간을 엄수해 주세요.

- **[준비 10분]** Fork, Codespaces 실행 및 Supabase/Netlify 로그인 점검
- **[1교시 45분]** 데이터 정의(SQL), 권한(RLS) 설정, 환경변수(`.env.local`) 등록 및 실행 확인
- *(휴식 15분)*
- **[2교시 45분]** Copilot Plan 모드 설계 → Agent 구현 → 로컬 기능 검증
- *(휴식 15분)*
- **[3교시 30분]** 배포(Netlify 기본, GitHub Pages 비상 대안), 스마트폰 동기화 확인, 보안 체크포인트 작성, PR 제출

---

## 오늘의 브랜치 구조

```
main              (원본 보관 — 절대 merge하지 않습니다)
 └─ dev           (작업 통합 브랜치, PR 기준)
     ├─ diary     (감정 일기 구현 브랜치 — 완성 후 dev로 merge)
     └─ gh-pages  (비상 대안: GitHub Pages 배포 시에만 빌드 결과물이 올라감)
```

- `main`은 처음 Fork했을 때 상태 그대로 보관하는 원본입니다.
- 모든 작업과 PR(Pull Request) 제출은 `dev` 브랜치를 기준으로 진행합니다.

---

## 시작 상태

이 저장소의 `main`에는 **Vite + React 기본 프로젝트**와 필요한 의존성이 미리 세팅되어 있습니다.

| 파일 | 설명 |
|---|---|
| `package.json` | React 19, Vite, `@supabase/supabase-js` 사전 포함 |
| `vite.config.js` | 배포 경로 호환을 위한 `base: './'` 사전 설정 |
| `.env.example` | 환경변수 예시 파일 (값은 비어 있음) |
| `.gitignore` | `node_modules`, `dist`, **`.env*` 파일**이 GitHub에 올라가지 않도록 등록됨 |
| `guide.md` | 지금 보고 있는 매뉴얼 |
| `README.md` | 완성 후 직접 채우는 소개 및 보안 회고 뼈대 |

---

## 0단계 — 계정 준비 확인

수업 시작 전 미리 가입해 둔 두 계정에 로그인되어 있는지 확인합니다:
1. **[Supabase](https://supabase.com)** → GitHub 계정으로 로그인
2. **[Netlify](https://www.netlify.com)** → GitHub 계정으로 로그인

---

## 1단계 — Fork & Codespaces 열기

1. `26-w09-diary` 저장소를 본인 GitHub 계정으로 **Fork**합니다.
   - Fork 화면의 **Copy the `main` branch only** 체크는 그대로 둡니다.
2. 내 Fork 저장소에서 **Code → Codespaces → Create codespace on main**을 클릭합니다.
3. 브라우저에 VS Code 화면이 열릴 때까지 1~2분 기다립니다.
4. **💡 로컬 VS Code 프로그램으로 연결해서 열기 (강력 추천!)**:
   - 브라우저 상단 좌측 햄버거 메뉴(≡) → **Open in VS Code Desktop**을 클릭하거나, 화면 우하단 알림/톱니바퀴에서 **Open in VS Code**를 누릅니다.
   - 내 컴퓨터의 VS Code 창으로 Codespace가 연결됩니다. (필요시 'GitHub Codespaces' 확장 프로그램 설치 메시지가 뜨면 설치를 누릅니다.)
   - 브라우저 탭 안에서 작업하는 것보다 내 컴퓨터의 단축키와 화면 배치가 훨씬 자연스럽고 편리합니다. (물론 브라우저 창에서 그대로 작업해도 무방합니다.)
5. VS Code 하단에 GitHub Copilot이 정상 로그인되어 있는지 확인합니다.

---

## 2단계 — `dev` 브랜치 생성, 의존성 설치 및 환경 커밋

`main`은 원본 보관용이므로, 실행 확인부터 `dev`에서 진행합니다.

1. 하단 터미널에서 `dev` 브랜치를 만들고 GitHub에 올립니다:
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```
2. 패키지 설치 및 실행 확인:
   ```bash
   npm install
   npm run dev
   ```
   > 💡 패키지(`package.json`)에 `@supabase/supabase-js`가 이미 포함되어 있으므로 추가 설치 없이 한 번에 끝납니다.
3. 오른쪽 아래 알림창에서 **Open in Browser**를 눌러 Vite + React 기본 화면이 뜨는지 확인합니다.
   - 알림을 놓쳤다면 하단 **PORTS** 탭 → `5173` 포트 옆 지구본 아이콘을 클릭합니다.
   - 확인 후 터미널에서 `Ctrl + C`를 눌러 서버를 잠시 종료합니다.
4. **초기 환경 커밋 (`package-lock.json`)**:
   - `git status`를 쳐보면 `package-lock.json` 파일이 새로 생성되어 있습니다.
   - 💡 **`package-lock.json`이란?**: 오늘 설치된 패키지들의 정확한 버전과 의존 관계를 완벽히 잠가두어, 나중에 Netlify 배포 서버에서도 정확히 똑같은 환경으로 빌드되도록 보증하는 파일입니다.
   - 💡 **`node_modules`는 왜 Git에 안 보이나요?**: 실제 수백 MB의 패키지 파일이 들어있는 `node_modules/`는 `.gitignore`에 등록되어 있어 Git이 추적하지 않는 로컬 실제 폴더입니다. Git 브랜치를 바꿔도 디스크에 계속 남아 있으므로, 어떤 브랜치에서든 그대로 쓸 수 있습니다.
   - 이 초기 환경을 `dev` 브랜치에 먼저 깔끔하게 커밋하고 푸시합니다:
     ```bash
     git add package.json package-lock.json
     git commit -m "chore: 프로젝트 초기 의존성 설치 및 package-lock 생성"
     git push origin dev
     ```
5. 기능 개발을 위한 작업 브랜치 `diary` 생성:
   ```bash
   git checkout -b diary
   ```

이후 구현 작업은 모두 `diary` 브랜치에서 진행합니다. (이제 `diary` 브랜치는 오직 감정 일기 기능 구현 커밋에만 집중할 수 있습니다!)

---

## 3단계 — Supabase 프로젝트와 테이블 만들기 (데이터 정의)

### 3-1. 프로젝트 생성
1. [Supabase 대시보드](https://supabase.com/dashboard) → **New project** 클릭
2. Name: `w09-diary` (자유롭게 입력), Region: **Northeast Asia (Seoul)** 선택
3. Database Password: 자동 생성 버튼을 누르고 **비밀번호를 메모장에 따로 복사**해둡니다.
4. **💡 Security 옵션 안내**:
   - **Enable automatic RLS**: 체크해 두는 것을 권장합니다. (체크하지 않아도 3-2단계 SQL에서 직접 RLS를 켜기 때문에 실습에는 지장이 없지만, 테이블 생성 시 자동으로 보안을 켜주는 안전한 습관입니다.)
5. **GitHub 저장소 연결 옵션은 연결하지 않고 건너뜁니다.**
6. **Create new project** 클릭 → 프로젝트가 준비될 때까지 1~2분 기다립니다.

### 3-2. SQL로 테이블 및 보안 정책 생성
왼쪽 메뉴 **SQL Editor** 클릭 → **New query**에 아래 SQL 전체를 복사해 붙여넣고 **Run**(실행)을 누릅니다:

```sql
-- 1) 감정 일기 테이블 생성 (데이터 정의)
create table public.diaries (
  id bigint primary key generated always as identity,
  content text not null,
  emotion text not null check (emotion in ('joy', 'calm', 'sad', 'angry', 'anxious')),
  created_at timestamptz not null default now()
);

-- 2) 브라우저(anon 역할) 접근 권한 부여
grant select, insert, delete on public.diaries to anon;

-- 3) 행 단위 보안(RLS) 활성화
alter table public.diaries enable row level security;

-- 4) RLS 정책: 누구나 읽기 / 쓰기 / 삭제 허용 (실습용 정책)
create policy "anyone can read" on public.diaries
  for select to anon using (true);

create policy "anyone can insert" on public.diaries
  for insert to anon with check (true);

create policy "anyone can delete" on public.diaries
  for delete to anon using (true);
```

왼쪽 메뉴 **Table Editor**를 눌러 `diaries` 테이블과 4개 컬럼(`id`, `content`, `emotion`, `created_at`)이 정상 생성되었는지 확인합니다.

> 🔍 **[보안 체크포인트 1]**
> - `emotion` 컬럼에 지정된 `check (emotion in (...))`은 왜 필요할까요?
> - `grant`와 `create policy (RLS)`는 각각 무엇을 막고 무엇을 허용하나요?

---

## 4단계 — 환경변수(`.env.local`) 설정

1. Supabase 대시보드에서 두 가지 접속 정보를 확인합니다:
   - **Project URL** (`https://xxxx.supabase.co`): 왼쪽 메뉴 **Project Overview** 상단
   - **Publishable Key** (`sb_publishable_...`로 시작): 왼쪽 메뉴 **Project Settings → API Keys**
   > ⚠️ **주의**: 상단의 **Connect** 버튼은 쓰지 마세요. 또한 `sb_secret_...` 또는 `service_role` 키는 RLS를 우회하는 위험한 관리자 키이므로 **절대 프론트엔드 코드에 사용하지 마세요.**
2. 프로젝트 루트의 `.env.example`을 복사하여 **`.env.local`** 파일을 만듭니다:
   ```bash
   cp .env.example .env.local
   ```
3. `.env.local` 파일을 열고 본인의 키 값을 입력합니다:
   ```env
   VITE_SUPABASE_URL=https://본인프로젝트.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_본인키
   ```
4. 터미널에서 Git 추적 여부를 확인합니다:
   ```bash
   git status
   ```
   > 💡 **왜 커밋하지 않고 그냥 넘어가나요?**:
   > - `git status`를 쳐보면 `nothing to commit, working tree clean`이라며 **`.env.local`이 목록에 전혀 보이지 않습니다.**
   > - 이것이 정상입니다! 접속 키가 들어있는 파일이 GitHub 저장소에 노출되는 것을 막기 위해 `.gitignore`에 등록되어 있기 때문입니다.
   > - **이 단계에서는 커밋할 파일이 없으므로, 커밋 없이 바로 5단계로 넘어갑니다.**
   > - *(만약 `git status`에 `.env.local`이 빨간색으로 보인다면 커밋하지 말고 즉시 알려주세요!)*

---

## 5단계 — Copilot Plan 모드 → Agent 모드로 일기장 구현

### 5-1. Copilot Plan 모드로 요구사항(PRD) 전송
1. VS Code의 Copilot Chat 창을 열고, 입력창 위의 모드를 **Plan 모드**로 변경합니다.
2. 아래 프롬프트 상자 우측 상단의 **복사(📋) 버튼**을 눌러 Copilot Chat에 그대로 전송합니다:

```markdown
[Copilot Plan 모드 프롬프트 — 감정 일기 PRD]
아래 PRD를 바탕으로 감정 일기 웹앱을 구현해줘.
이 프로젝트는 Vite + React로 세팅되어 있고 @supabase/supabase-js도 설치되어 있어.

## 1. 목표
하루의 감정과 생각을 기록하고, PC와 스마트폰 등 어느 기기에서 열어도 동일한 기록을 확인할 수 있는 감정 일기장 (새로고침/재조회 기반 기본 CRUD 연동, Realtime 웹소켓 기능은 제외)

## 2. 데이터 정의 (Supabase `diaries` 테이블 사용 — 이미 DB에 생성되어 있음)
- id: bigint, 자동 생성
- content: text, 일기 본문 (필수)
- emotion: text, 감정 구분 ('joy' | 'calm' | 'sad' | 'angry' | 'anxious' 중 하나)
- created_at: timestamptz, 작성 일시 (DB 기본값)

## 3. 화면 및 기능 요구사항
- 작성 영역:
  - 감정 선택 버튼 5개 (😊 기쁨=joy, 😌 평온=calm, 😢 슬픔=sad, 😠 화남=angry, 😰 불안=anxious)
  - 내용 입력창(textarea/input) + 저장 버튼
- 목록 영역:
  - 작성된 일기를 최신순(created_at 내림차순)으로 카드 형태로 표시
  - 각 카드에 감정 이모지, 본문 내용, 작성 날짜/시간, 삭제 버튼 배치
- 감정 필터:
  - 전체 보기 / 감정별 모아보기 탭 필터
- 상태 처리:
  - 로딩 중: 목록 조회 중 로딩 인디케이터 표시
  - 저장 중: 저장 버튼 비활성화 및 "저장 중..." 텍스트 표시 (중복 클릭 방지)
  - 빈 상태: 작성된 일기가 없거나 필터 결과가 없을 때 친절한 안내 문구
  - 오류 상태: 네트워크/키 오류 발생 시 화면에 안내 메시지 표시

## 4. 구조 및 아키텍처 요구사항
- Supabase 클라이언트 초기화는 `src/lib/supabase.js` 한 곳에서만 생성할 것
  (import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY 사용)
- 데이터베이스 조회(select), 추가(insert), 삭제(delete) 함수는 `src/api/diaries.js`에 모듈로 분리할 것
- Supabase Realtime(웹소켓 구독)은 사용하지 않고, 일기 작성·삭제 시 목록을 재조회(fetch)하는 기본 CRUD 방식으로 구현할 것
- 스타일은 Tailwind CSS를 활용해 모바일과 데스크톱 모두 깔끔한 반응형 카드 디자인으로 적용할 것
- Vite 기본 예시 템플릿 코드와 이미지(hero, reactLogo 등)는 깔끔히 정리할 것
```

---

### 5-2. 계획 검토 및 구현 승인 (사람이 할 일)
1. Copilot이 답변으로 제시한 **구현 계획(Plan)**을 읽고 아래 3가지가 포함되었는지 확인합니다:
   - [ ] `src/lib/supabase.js` 클라이언트 생성 계획이 있는가?
   - [ ] `src/api/diaries.js`에 CRUD 함수를 분리하는 계획이 있는가?
   - [ ] 로딩·저장 중·오류·빈 상태 처리가 포함되었는가?
2. 계획이 만족스러우면 **Start Implementation** 버튼을 누릅니다.
   - 💡 **버튼이 안 보이고 "계획 검토 필요"만 깜빡일 때**: 채팅창에 `계획 승인, 구현 시작해줘`라고 입력하면 Agent가 즉시 구현을 시작합니다.
3. Agent가 구현을 마칠 때까지 잠시 기다립니다 (터미널 명령어 실행 허용 창이 뜨면 허용해 줍니다).

---

### 5-3. 로컬 실행 검증 및 커밋
1. 구현이 완료되면 터미널에서 실행합니다:
   ```bash
   npm run dev
   ```
2. 브라우저에서 아래 항목들을 하나씩 테스트합니다:
   - 일기를 작성하고 저장을 누르면 목록에 바로 뜨는가?
   - **새로고침(F5)**을 해도 일기가 사라지지 않고 그대로 유지되는가?
   - Supabase 대시보드의 **Table Editor**에서도 방금 쓴 일기 데이터가 들어갔는가?
   - 일기를 삭제했을 때 화면과 Supabase DB 양쪽에서 모두 사라지는가?
3. 모든 기능이 정상 동작하면 `diary` 브랜치에 커밋합니다:
   ```bash
   git add .
   git commit -m "feat: Supabase 연동 감정 일기 구현"
   ```

---

## 6단계 — 보안 점검 (사이버보안과 필수 체크포인트)

1. 앱이 실행 중인 브라우저에서 **개발자 도구(F12) → Network(네트워크) 탭**을 엽니다.
2. 페이지를 새로고침(F5)합니다.
3. **💡 Supabase 요청 쉽게 찾는 법**:
   - 상단 필터 바에서 `모두(All)` 대신 **`Fetch/XHR`** 버튼을 클릭하거나, 좌측 상단 검색창에 **`diaries`**를 입력합니다.
   - 개발 서버의 수많은 JS/CSS 번들 파일이 걸러지고, Supabase 서버와 통신한 API 요청(`diaries?...`)만 깔끔하게 남습니다.
4. 목록에 나타난 **`diaries?...`** 요청을 클릭하고, 우측 창의 **Headers(헤더)** 탭을 선택합니다.
5. 아래로 스크롤하여 **Request Headers(요청 헤더)**를 확인해 보세요. 방금 `.env.local`에 넣었던 Publishable Key가 그대로 보입니다!
   - `apikey: sb_publishable_xxxx...`
   - `authorization: Bearer sb_publishable_xxxx...`

> 🧠 **사이버보안과 생각거리**:
> 1. `.env.local`로 숨겨두었는데 왜 브라우저 요청에서 키가 보일까요?
>    → 프론트엔드 코드는 결국 사용자의 브라우저에서 실행되므로 브라우저에 전달된 값은 숨길 수 없습니다. **Publishable Key는 공개를 전제로 만들어진 식별 키**입니다.
> 2. 그렇다면 `.env.local`은 왜 쓰는 것일까요?
>    → 키가 GitHub 저장소(코드 커밋 기록)에 영구 박제되는 것을 막고, 개발/배포 환경에 따라 다른 값을 유연하게 주입하기 위함입니다.
> 3. 키가 공개된다면 데이터는 무엇이 지켜주나요?
>    → 데이터베이스의 **권한(`grant`)과 행 단위 보안(`RLS`)** 정책이 지켜줍니다.
> 4. 지금 우리가 설정한 정책(`using (true)`)의 취약점은 무엇인가요?
>    → 누구나 API 키만 알면 다른 사람의 일기까지 모두 읽고 마음대로 삭제할 수 있습니다. (실제 서비스에서는 로그인 인증과 `auth.uid() = user_id` 검증이 필수입니다.)

---

## 7단계 — `dev` 브랜치 병합 및 README 작성

1. `diary` 브랜치를 `dev`로 병합합니다:
   ```bash
   git checkout dev
   git merge diary
   ```
2. `README.md`를 열고, 6단계 보안 체크포인트에서 배운 내용과 앱 소개를 자신의 언어로 채워 넣습니다.
3. 커밋 및 푸시합니다:
   ```bash
   git add README.md
   git commit -m "docs: 실습 완료 및 보안 점검 README 작성"
   git push origin dev
   ```

---

## 8단계 — 배포 (두 개의 다른 플랫폼에 모두 배포해보기!)

### 💡 왜 4~8주차와 배포 방식이 다른가요?
- **4~8주차 정적 사이트**: `index.html`, `script.js` 파일 그대로 브라우저가 실행할 수 있었습니다.
- **9주차 React 앱**: JSX 문법과 컴포넌트는 브라우저가 직접 이해하지 못합니다. Vite 번들러가 이를 하나의 최적화된 HTML/CSS/JS 파일 묶음(`dist` 폴더)으로 **변환(빌드)**해야만 서비스할 수 있습니다.

오늘은 현대 웹에서 가장 많이 쓰는 **2가지 배포 방식(Netlify와 GitHub Pages)**을 모두 실습합니다. 두 플랫폼에 모두 배포하면 9단계에서 놀라운 장면을 목격하게 됩니다!

---

### [배포 1] Netlify 배포 (클라우드 자동 빌드 CI/CD)

Netlify는 GitHub 저장소에 코드가 올라오면, Netlify 클라우드 서버에서 자동으로 `npm run build`를 실행하여 배포해 줍니다.

1. [Netlify 대시보드](https://app.netlify.com) 접속 → **Add new site → Import an existing project** 클릭
2. **GitHub** 선택 → 저장소 목록에서 내 Fork 저장소(`26-w09-diary`) 선택
3. 배포 설정 확인:
   - Branch to deploy: **`dev`**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **환경변수 등록 (가장 중요!)**:
   - 화면 하단의 **Add environment variables** 클릭
   - `.env.local`에 등록했던 2가지 변수를 입력합니다:
     - `VITE_SUPABASE_URL` : `https://xxxx.supabase.co`
     - `VITE_SUPABASE_PUBLISHABLE_KEY` : `sb_publishable_xxxx`
   - ⚠️ **주의**: **"Contains secret values" 옵션은 절대 체크하지 마세요!** (체크하면 브라우저용 공개 키를 비밀로 오인하여 Netlify가 빌드를 실패시킵니다.)
5. **Deploy 26-w09-diary** 버튼 클릭 → 1~2분 뒤 초록색 완료 표시와 함께 배포 URL(`https://랜덤이름.netlify.app`)이 생성됩니다.
6. 배포 URL로 접속하여 일기장이 잘 뜨는지 확인합니다.

---

### [배포 2] GitHub Pages 배포 (로컬 빌드 후 결과물 배포)

이번에는 내 개발환경(Codespaces)에서 직접 빌드하고, 그 결과물(`dist`)만 `gh-pages` 브랜치로 올려 배포해 봅니다.

1. Codespaces 터미널(`dev` 브랜치 상태)에서 직접 빌드를 수행합니다:
   ```bash
   npm run build
   ```
   > `dist` 폴더가 생성되며, `.env.local`의 키 값이 배포용 JS 안에 자동으로 빌드되어 들어갑니다.
2. 빌드 결과물(`dist`)만 `gh-pages` 브랜치로 올립니다:
   ```bash
   npx gh-pages -d dist
   ```
   > 💡 **브랜치를 미리 만들지 않아도 되나요?**  
   > 네! 3~8주차처럼 `git checkout -b gh-pages`를 손으로 미리 만들 필요가 전혀 없습니다. `npx gh-pages` 도구가 원격 저장소에 `gh-pages` 브랜치를 자동으로 새로 생성하고 `dist` 폴더 내용물만 깔끔하게 올려줍니다.
   - `Ok to proceed? (y)`가 나오면 `y` 입력
   - 몇 초 뒤 `Published` 문구가 나오면 배포 완료입니다.
3. GitHub 내 저장소 웹페이지 → **Settings → Pages** 이동:
   - Source: **Deploy from a branch**
   - Branch: 방금 도구가 자동으로 생성해 준 **`gh-pages`**, Folder: **`/(root)`** 선택 후 Save
   - 1~2분 뒤 `https://내아이디.github.io/26-w09-diary/` 주소로 배포 완료!

---

## 9단계 — 오늘의 핵심 하이라이트: Netlify ↔ GitHub Pages ↔ 스마트폰 삼각 동기화!

서로 완전히 다른 3개의 환경이 하나의 중앙 데이터베이스(Supabase)를 공유하고, 새로고침으로 같은 기록을 확인하는 방법을 살펴봅니다.

1. 컴퓨터 브라우저에 **Netlify 배포 사이트**와 **GitHub Pages 배포 사이트**를 나란히 두 창으로 띄웁니다.
2. **스마트폰 브라우저**로도 둘 중 하나의 주소에 접속합니다.
3. **[테스트 1: Netlify에서 쓰고 GitHub Pages에서 보기]**:
   - **Netlify 사이트**에서 감정 일기를 하나 작성해 보세요.
   - **GitHub Pages 사이트**를 새로고침해 보세요. Netlify에서 쓴 글이 그대로 나타납니다!
4. **[테스트 2: 스마트폰에서 쓰고 PC에서 보기]**:
   - 이번에는 **스마트폰**에서 새 일기를 작성해 보세요.
   - 컴퓨터의 두 사이트를 새로고침해 보세요. 스마트폰에서 쓴 글이 두 사이트 모두에 나타납니다!
5. **[테스트 3: 한 곳에서 삭제하고 다른 곳 확인하기]**:
   - GitHub Pages 사이트에서 일기 하나를 삭제해 보세요.
   - Netlify 사이트를 새로고침하면 삭제가 반영되어 사라집니다!

> 🎉 **오늘의 가장 중요한 배움**:
> - 프론트엔드 호스팅이 Netlify에 있든, GitHub Pages에 있든, 내 스마트폰에 있든 상관없습니다.
> - **"모든 화면은 그저 껍데기(UI)일 뿐이며, 진짜 서비스의 본체는 중앙의 클라우드 데이터베이스(Supabase)에 살아 숨쉰다"**는 현대 클라우드 웹 아키텍처의 본질을 직접 눈으로 확인했습니다!

---

## 10단계 — README 배포 링크 기재, 태그 및 PR 제출

1. `dev` 브랜치의 `README.md`에 배포된 URL을 기재하고 커밋 & 푸시합니다:
   ```bash
   git add README.md
   git commit -m "docs: 배포 URL 추가"
   git push origin dev
   ```
2. 작업 완료를 기록하기 위해 `dev` 브랜치에 버전 태그를 붙이고 푸시합니다:
   ```bash
   git tag v1.0
   git push origin v1.0
   ```
3. **내 저장소 `dev` → 원본 저장소(`kopo-kangseo-cybersec/26-w09-diary`) `main`** 방향으로 Pull Request를 생성하고 템플릿을 채워 제출합니다.
   - 💡 `main`은 초기 템플릿 보존용이므로, 별도로 Release Note를 쓸 필요 없이 태그와 PR 제출로 완성이 인정됩니다.
4. 실습이 끝난 후 [github.com/codespaces](https://github.com/codespaces)에서 오늘 사용한 Codespace를 반드시 **Stop**합니다.

---

## 💡 [보너스] 만약 Codespace를 삭제하고 내 컴퓨터(로컬)에서 이어서 작업하려면?

Codespaces를 삭제했더라도 당황하지 마세요! 소스 코드는 GitHub에, 일기 데이터는 Supabase에 영구 보존되어 있습니다. 내 로컬 컴퓨터에서 1분 만에 환경을 복원할 수 있습니다:

1. **내 Fork 저장소 Clone** (작업 브랜치인 `dev`로 가져옵니다):
   ```bash
   git clone -b dev https://github.com/내아이디/26-w09-diary.git
   cd 26-w09-diary
   ```
2. **라이브러리 재설치 (`node_modules` 복원)**:
   ```bash
   npm install
   ```
3. **환경변수 파일 재생성 (`.env.local` 복원)**:
   - Git에는 키가 없으므로 `.env.example`을 복사해 `.env.local`을 다시 만듭니다:
     ```bash
     cp .env.example .env.local
     ```
   - Supabase 대시보드에서 내 Project URL과 Publishable Key를 다시 복사해 넣습니다.
4. **실행**:
   ```bash
   npm run dev
   ```

---

## 막혔을 때 (FAQ / Troubleshooting)

- **Netlify 배포 후 화면이 하얗게 나오거나 데이터가 안 불러와진다**:
  → Netlify 대시보드의 **Site configuration → Environment variables**에 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`가 오타 없이 들어갔는지 확인하세요. 등록 후 반드시 **Deploys → Trigger deploy → Clear cache and deploy site**를 눌러 재빌드해야 합니다.
- **`permission denied for table diaries` 오류가 발생한다**:
  → 3-2단계 SQL의 `grant select, insert, delete on public.diaries to anon;` 구문이 실행되지 않았습니다. Supabase SQL Editor에서 다시 실행하세요.
- **일기를 저장하려는데 `new row violates check constraint` 에러가 발생한다**:
  → 테이블 정의 시 지정한 5가지 감정(`joy`, `calm`, `sad`, `angry`, `anxious`) 외의 다른 값이 전송되고 있습니다. `src/api/diaries.js`나 컴포넌트의 감정 value 값을 확인하세요.
- **GitHub Pages 배포 후 빈 화면만 나온다**:
  → `vite.config.js`에 `base: './'` 설정이 있는지 확인하고, 다시 `npm run build` 후 `npx gh-pages -d dist`를 실행하세요.
