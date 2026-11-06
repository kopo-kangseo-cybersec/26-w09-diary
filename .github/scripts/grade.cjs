const fs = require('fs');

async function callGemini(model, apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  };

  console.log(`[Gemini] ${model} 모델 호출 시작...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Gemini] ${model} HTTP Error ${res.status}:`, errText);
      return null;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.error('[Gemini] 빈 응답 수신:', JSON.stringify(data));
      return null;
    }

    // 모든 text 파트 병합 (thinking 파트 분리 고려)
    const reply = candidate.content.parts
      .map(p => p.text || '')
      .filter(Boolean)
      .join('\n')
      .trim();

    return reply;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[Gemini] ${model} 호출 예외:`, err.message);
    return null;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('::warning::GEMINI_API_KEY가 등록되지 않았습니다. 기본 접수 코멘트만 등록합니다.');
    fs.writeFileSync('result_comment.txt', '### ✅ 과제 제출 접수 완료\n과제가 정상적으로 접수되었습니다. (자동 채점 API 키 설정 대기 중)');
    fs.writeFileSync('summary.txt', '기본 접수 완료 (Gemini API 키 미설정)');
    return;
  }

  const prBody = fs.existsSync('pr_body.txt') ? fs.readFileSync('pr_body.txt', 'utf8') : '';
  const prDiff = fs.existsSync('pr_diff.txt') ? fs.readFileSync('pr_diff.txt', 'utf8') : '';
  const author = process.env.PR_AUTHOR || '학생';

  const systemPrompt = `당신은 한국폴리텍대학 강서캠퍼스 사이버보안과 1학년 「웹콘텐츠 제작」 수업의 AI 채점 조교입니다.
학생이 제출한 PR 본문과 코드 변경점(diff)을 검토하여 정중하고 친절한 어조(존댓말)로 전문적인 채점 피드백을 작성해 주세요.

## 9주차 감정 다이어리 채점 기준표
1. [보안 점검]
   - diff에 .env, .env.local 등 실제 환경변수 파일이나 시크릿 키가 커밋되어 있는지 확인. (절대 없어야 함! 발견 시 엄중 경고)
   - 소스 코드에 키가 하드코딩되지 않고 import.meta.env로 올바르게 분리되었는지 확인.
2. [아키텍처 모듈화]
   - src/lib/supabase.js (클라이언트 초기화) 및 src/api/diaries.js (CRUD 분리) 계층 분리가 적용되었는지 확인.
3. [배포 및 완성도]
   - PR 본문에 Netlify 및 GitHub Pages 배포 URL이 적혀 있는지 확인.
   - 체크리스트가 성실하게 체크되었는지 확인.
4. [성찰 및 한 줄 소감]
   - localStorage(8주차) vs Supabase(9주차) 차이점 등 소감이 성의 있게 작성되었는지 확인.

## 출력 형식 (Markdown)
### 📋 9주차 과제 채점 리포트 (${author} 학생)

| 평가 항목 | 결과 | 코멘트 |
|---|:---:|---|
| 🛡️ 보안 수칙 (.env 제외, 키 분리) | ✅ PASS / ⚠️ 주의 | 내용 요약 |
| 🏗️ 아키텍처 (lib/api 모듈화) | ✅ PASS / ⚠️ 보완 | 내용 요약 |
| 🚀 배포 (Netlify & Pages) | ✅ PASS / ⚠️ 확인 | 내용 요약 |
| ✍️ 한 줄 소감 및 성찰 | ✅ PASS / 💬 조언 | 피드백 요약 |

#### 💡 총평 및 피드백
- 학생의 구현 노력을 칭찬하고 개선 포인트를 친절하게 짚어주세요.

#### 🎯 종합 판정: [통과 (PASS)] 또는 [보완 필요]
`;

  const fullPrompt = `${systemPrompt}\n\n## [학생이 제출한 PR 본문]\n${prBody}\n\n## [코드 변경점 Diff]\n${prDiff}`;

  // 1차 시도: gemini-3.8-flash, 실패 시 fallback: gemini-1.5-flash
  let reply = await callGemini('gemini-3.8-flash', apiKey, fullPrompt);
  if (!reply) {
    console.log('[Gemini] gemini-1.5-flash 모델로 대체 시도...');
    reply = await callGemini('gemini-1.5-flash', apiKey, fullPrompt);
  }

  if (reply) {
    fs.writeFileSync('result_comment.txt', reply);
    const isPass = reply.includes('통과') || reply.includes('PASS');
    fs.writeFileSync('summary.txt', isPass ? '통과 (PASS)' : '보완 필요');
    console.log('[Gemini] 채점 완료:', isPass ? 'PASS' : 'RETRY');
  } else {
    fs.writeFileSync('result_comment.txt', '### ⚠️ 과제 제출 접수 완료\n과제는 정상 접수되었으나 일시적인 AI 서비스 응답 지연으로 자동 채점 리포트가 생성되지 않았습니다. 교수가 직접 검토할 예정입니다.');
    fs.writeFileSync('summary.txt', '접수 완료 (AI 응답 지연)');
  }
}

main();
