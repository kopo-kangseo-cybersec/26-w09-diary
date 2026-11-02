
import { useEffect, useState } from 'react'
import {
  getDiaries,
  addDiary,
  deleteDiary,
} from './api/diaries'

const EMOTIONS = [
  { value: 'joy', emoji: '😊', label: '기쁨' },
  { value: 'calm', emoji: '😌', label: '평온' },
  { value: 'sad', emoji: '😢', label: '슬픔' },
  { value: 'angry', emoji: '😠', label: '화남' },
  { value: 'anxious', emoji: '😰', label: '불안' },
]

const FILTERS = [
  { value: 'all', label: '전체 보기' },
  ...EMOTIONS,
]

// 날짜 표시
function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

// 오류 메시지 처리
function getErrorMessage(error) {
  const message = error?.message ?? String(error)

  if (
    message.includes('VITE_SUPABASE_URL') ||
    message.includes('VITE_SUPABASE_PUBLISHABLE_KEY')
  ) {
    return message
  }

  if (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.toLowerCase().includes('fetch failed')
  ) {
    return '서버에 연결할 수 없습니다. 인터넷 연결과 Supabase 프로젝트 URL을 확인해 주세요.'
  }

  if (
    message.includes('Invalid API key') ||
    message.includes('Invalid JWT')
  ) {
    return 'Supabase 인증 키가 올바르지 않습니다. Publishable Key를 확인해 주세요.'
  }

  if (error?.code === '42P01') {
    return 'diaries 테이블을 찾을 수 없습니다. Supabase 데이터베이스를 확인해 주세요.'
  }

  if (error?.code === '42501') {
    return '데이터베이스 접근 권한이 없습니다. Supabase RLS 정책을 확인해 주세요.'
  }

  return `작업 중 오류가 발생했습니다: ${message}`
}

function App() {
  // 데이터 상태
  const [diaries, setDiaries] = useState([])

  // 입력 상태
  const [content, setContent] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState(null)

  // 화면 상태
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  // 일기 목록 조회
  async function loadDiaries() {
    setLoading(true)
    setError('')

    try {
      const data = await getDiaries()
      setDiaries(data)
    } catch (err) {
      console.error('일기 조회 오류:', err)
      setDiaries([])
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // 앱을 처음 열면 DB에서 일기 조회
  useEffect(() => {
    loadDiaries()
  }, [])

  // 일기 저장
  async function handleSave(event) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent) {
      setError('일기 내용을 입력해 주세요.')
      return
    }

    if (!selectedEmotion) {
      setError('오늘의 감정을 선택해 주세요.')
      return
    }

    if (saving) return

    setSaving(true)
    setError('')

    try {
      await addDiary({
        content: trimmedContent,
        emotion: selectedEmotion,
      })

      setContent('')
      setSelectedEmotion(null)
      setActiveFilter('all')

      // 저장 후 목록 재조회
      await loadDiaries()
    } catch (err) {
      console.error('일기 저장 오류:', err)
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  // 일기 삭제
  async function handleDelete(id) {
    const confirmed = window.confirm(
      '이 일기를 정말 삭제하시겠습니까?'
    )

    if (!confirmed) return

    setDeletingId(id)
    setError('')

    try {
      await deleteDiary(id)

      // 삭제 후 목록 재조회
      await loadDiaries()
    } catch (err) {
      console.error('일기 삭제 오류:', err)
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  // 감정별 필터
  const filteredDiaries =
    activeFilter === 'all'
      ? diaries
      : diaries.filter(
          (diary) => diary.emotion === activeFilter
        )

  // 감정 정보 찾기
  function getEmotion(emotionValue) {
    return EMOTIONS.find(
      (emotion) => emotion.value === emotionValue
    ) ?? {
      emoji: '💭',
      label: '기록',
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-8 text-[#302d2a] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">

        {/* 상단 제목 */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#8b766b] shadow-sm">
            <span>🌷</span>
            <span>나를 위한 작은 공간</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#38312d] sm:text-4xl">
            마음 기록소
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#92877f] sm:text-base">
            오늘 하루의 감정과 생각을 편안하게 기록해 보세요.
          </p>
        </header>

        {/* 일기 작성 영역 */}
        <section className="rounded-[28px] border border-[#eee8e2] bg-white p-5 shadow-[0_12px_40px_rgba(70,50,30,0.05)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#403932]">
              오늘의 마음은 어떤가요?
            </h2>

            <p className="mt-2 text-sm text-[#a29890]">
              지금 느끼는 감정을 선택해 주세요.
            </p>
          </div>

          {/* 감정 선택 */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {EMOTIONS.map((emotion) => {
              const selected =
                selectedEmotion === emotion.value

              return (
                <button
                  key={emotion.value}
                  type="button"
                  onClick={() =>
                    setSelectedEmotion(emotion.value)
                  }
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-1 py-4 transition-all sm:py-5 ${
                    selected
                      ? 'border-[#c99b80] bg-[#fbf0e9] shadow-sm'
                      : 'border-[#f0ece8] bg-[#fcfbfa] hover:border-[#dbc2b2] hover:bg-[#fbf5f0]'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">
                    {emotion.emoji}
                  </span>

                  <span
                    className={`text-xs font-semibold sm:text-sm ${
                      selected
                        ? 'text-[#946d57]'
                        : 'text-[#8d8178]'
                    }`}
                  >
                    {emotion.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 일기 입력 */}
          <form onSubmit={handleSave} className="mt-7">
            <label
              htmlFor="diary-content"
              className="mb-3 block text-sm font-bold text-[#62574f]"
            >
              오늘의 이야기
            </label>

            <textarea
              id="diary-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="오늘 있었던 일, 기억하고 싶은 순간, 마음속 생각을 자유롭게 적어보세요..."
              rows={6}
              className="w-full resize-y rounded-2xl border border-[#eee8e2] bg-[#fcfbfa] px-4 py-4 text-sm leading-7 text-[#49413b] outline-none transition placeholder:text-[#b8aea6] focus:border-[#c99b80] focus:bg-white focus:ring-4 focus:ring-[#f7eee8] sm:text-base"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#aaa098]">
                💌 당신의 마음을 자유롭게 기록하세요.
              </p>

              <button
                type="submit"
                disabled={
                  saving ||
                  !content.trim() ||
                  !selectedEmotion
                }
                className="rounded-xl bg-[#a9826c] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#916d58] disabled:cursor-not-allowed disabled:bg-[#c9bdb5]"
              >
                {saving ? '저장 중...' : '일기 저장하기 ✨'}
              </button>
            </div>
          </form>
        </section>

        {/* 오류 메시지 */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* 일기 목록 제목 */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#403932] sm:text-2xl">
                나의 마음 모아보기
              </h2>

              <p className="mt-2 text-sm text-[#a29890]">
                지금까지 기록한 소중한 순간들
              </p>
            </div>

            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#a18471] shadow-sm">
              총 {diaries.length}개
            </span>
          </div>

          {/* 필터 탭 */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {FILTERS.map((filter) => {
              const active =
                activeFilter === filter.value

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter.value)
                  }
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#a9826c] text-white shadow-sm'
                      : 'border border-[#eee8e2] bg-white text-[#96877c] hover:bg-[#f8f1eb]'
                  }`}
                >
                  {filter.value !== 'all' && (
                    <span className="mr-1">
                      {filter.emoji}
                    </span>
                  )}

                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#eee8e2] bg-white py-16">
              <div
                className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#eee5de] border-t-[#a9826c]"
                aria-label="로딩 중"
              />

              <p className="text-sm text-[#a29890]">
                소중한 기록을 불러오고 있어요...
              </p>
            </div>
          )}

          {/* 일기 목록 */}
          {!loading && filteredDiaries.length > 0 && (
            <div className="space-y-4">
              {filteredDiaries.map((diary) => {
                const emotion = getEmotion(diary.emotion)

                return (
                  <article
                    key={diary.id}
                    className="rounded-3xl border border-[#eee8e2] bg-white p-5 shadow-[0_8px_25px_rgba(70,50,30,0.035)] transition hover:shadow-[0_12px_30px_rgba(70,50,30,0.07)] sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* 감정 이모지 */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbf2ec] text-2xl">
                        {emotion.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#98755f]">
                            {emotion.label}
                          </span>

                          <time
                            dateTime={diary.created_at}
                            className="text-xs text-[#aaa098]"
                          >
                            {formatDate(diary.created_at)}
                          </time>
                        </div>

                        {/* 일기 본문 */}
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#514942] sm:text-base">
                          {diary.content}
                        </p>

                        {/* 삭제 버튼 */}
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(diary.id)
                            }
                            disabled={deletingId === diary.id}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-[#b0a39a] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            {deletingId === diary.id
                              ? '삭제 중...'
                              : '🗑️ 삭제'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* 빈 상태 */}
          {!loading &&
            !error &&
            filteredDiaries.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#e8ded5] bg-white px-5 py-16 text-center">
                <div className="mb-4 text-5xl">
                  {activeFilter === 'all' ? '🌱' : '💭'}
                </div>

                <h3 className="font-bold text-[#65594f]">
                  {activeFilter === 'all'
                    ? '아직 작성된 일기가 없어요.'
                    : `${getEmotion(activeFilter).label} 감정의 기록이 없어요.`}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#a29890]">
                  {activeFilter === 'all'
                    ? '오늘의 감정을 첫 번째 일기로 남겨보세요.'
                    : '다른 감정 탭을 선택하거나 새로운 일기를 작성해 보세요.'}
                </p>
              </div>
            )}
        </section>

        {/* 하단 */}
        <footer className="mt-14 pb-6 text-center">
          <p className="text-xs leading-6 text-[#b1a49b]">
            Every feeling deserves to be remembered.
            <br />
            당신의 모든 감정을 응원합니다. 🌷
          </p>
        </footer>

      </div>
    </main>
  )
}

export default App
