const fs = require('fs');

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

  const payload = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\n## [학생이 제출한 PR 본문]\n${prBody}\n\n## [코드 변경점 Diff]\n${prDiff}`
      }]
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API HTTP Error:', res.status, errText);
      fs.writeFileSync('result_comment.txt', `### ⚠️ 채점 시스템 안내\nGemini API 응답 오류 (HTTP ${res.status}). 과제는 정상 접수되었습니다.`);
      fs.writeFileSync('summary.txt', `API 오류 (HTTP ${res.status})`);
      return;
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '채점 결과를 생성하지 못했습니다.';
    fs.writeFileSync('result_comment.txt', reply);

    const isPass = reply.includes('통과') || reply.includes('PASS');
    fs.writeFileSync('summary.txt', isPass ? '통과 (PASS)' : '보완 필요');
    console.log('Gemini 채점 완료:', isPass ? 'PASS' : 'RETRY');
  } catch (err) {
    console.error('Gemini 요청 처리 중 예외 발생:', err);
    fs.writeFileSync('result_comment.txt', '### ⚠️ 채점 시스템 안내\n자동 채점 처리 중 예외가 발생했습니다. 과제는 정상 접수되었습니다.');
    fs.writeFileSync('summary.txt', '채점 처리 예외');
  }
}

main();
