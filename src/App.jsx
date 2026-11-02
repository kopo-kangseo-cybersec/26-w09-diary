import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, getDiaries } from './api/diaries.js'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'bg-amber-100 text-amber-700' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'bg-teal-100 text-teal-700' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'bg-sky-100 text-sky-700' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'bg-rose-100 text-rose-700' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'bg-violet-100 text-violet-700' },
]

const getEmotion = (value) => emotions.find((emotion) => emotion.value === value)

function getErrorMessage(error) {
  const message = error instanceof Error
    ? error.message
    : typeof error?.message === 'string'
      ? error.message
      : ''

  if (/예시 값|placeholder/i.test(message)) {
    return message
  }

  if (/fetch|network/i.test(message)) {
    return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
  }

  if (/api.?key|supabase.*(url|key)/i.test(message)) {
    return 'Supabase URL 또는 공개 키를 확인해 주세요. .env.local 설정이 필요합니다.'
  }

  return message ? `요청에 실패했어요: ${message}` : '일기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
}

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [filter, setFilter] = useState('all')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchInitialDiaries() {
      try {
        const results = await getDiaries()
        if (!cancelled) {
          setDiaries(results)
          setError('')
        }
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchInitialDiaries()
    return () => {
      cancelled = true
    }
  }, [])

  const loadDiaries = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      setDiaries(await getDiaries())
      setError('')
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  const visibleDiaries = useMemo(
    () => (filter === 'all' ? diaries : diaries.filter((diary) => diary.emotion === filter)),
    [diaries, filter],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || !selectedEmotion || saving) return

    setSaving(true)
    setError('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion('')
      await loadDiaries(true)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setError('')

    try {
      await deleteDiary(id)
      await loadDiaries(true)
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800">
      <header className="border-b border-stone-200/80 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center gap-3 text-stone-800 no-underline">
            <span className="grid size-10 place-items-center rounded-2xl bg-rose-100 text-xl" aria-hidden="true">
              🌷
            </span>
            <span className="text-lg font-bold tracking-tight">마음 한 페이지</span>
          </a>
          <span className="hidden text-sm text-stone-500 sm:block">오늘의 마음을 천천히 들여다봐요</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section className="mb-9 max-w-2xl">
          <p className="mb-3 text-sm font-semibold tracking-[0.16em] text-rose-500">A LITTLE SPACE FOR YOU</p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">오늘은 어떤 마음인가요?</h1>
          <p className="mt-3 leading-7 text-stone-500">
            잘한 일도, 복잡한 마음도 괜찮아요.
            <br className="sm:hidden" /> 오늘의 나에게 다정한 한 줄을 남겨보세요.
          </p>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(70,50,40,0.28)] sm:p-7">
            <div className="mb-6">
              <p className="text-sm font-medium text-rose-500">오늘의 기록</p>
              <h2 className="mt-1 text-xl font-bold text-stone-900">마음을 기록해 보세요</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <fieldset disabled={saving} className="min-w-0">
                <legend className="mb-3 text-sm font-semibold text-stone-700">지금 느끼는 감정</legend>
                <div className="grid grid-cols-5 gap-2">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.value}
                      type="button"
                      aria-pressed={selectedEmotion === emotion.value}
                      onClick={() => setSelectedEmotion(emotion.value)}
                      className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 transition ${
                        selectedEmotion === emotion.value
                          ? 'border-rose-300 bg-rose-50 ring-2 ring-rose-100'
                          : 'border-stone-100 bg-stone-50 hover:border-stone-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{emotion.emoji}</span>
                      <span className="text-xs font-medium text-stone-600">{emotion.label}</span>
                    </button>
                  ))}
                </div>

                <label htmlFor="diary-content" className="mb-2 mt-6 block text-sm font-semibold text-stone-700">
                  오늘의 이야기
                </label>
                <textarea
                  id="diary-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="무슨 일이 있었나요? 지금 떠오르는 생각을 편하게 적어보세요."
                  rows={7}
                  required
                  className="w-full resize-y rounded-2xl border border-stone-200 bg-[#fdfcfb] px-4 py-3.5 leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100/70"
                />
              </fieldset>

              <button
                type="submit"
                disabled={saving || !content.trim() || !selectedEmotion}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-800 px-5 py-3.5 font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {saving ? '저장 중...' : '오늘의 일기 저장하기'}
                {!saving && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
              기록은 나중에 다시 찾아볼 수 있도록 안전하게 보관돼요.
            </p>
          </section>

          <section aria-labelledby="diary-list-title">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-rose-500">YOUR JOURNAL</p>
                <h2 id="diary-list-title" className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
                  마음 기록 모아보기
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-500 ring-1 ring-stone-200">
                {diaries.length}개의 기록
              </span>
            </div>

            <div role="tablist" aria-label="감정별 일기 필터" className="mb-5 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => setFilter('all')}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === 'all' ? 'bg-stone-800 text-white' : 'bg-white text-stone-500 ring-1 ring-stone-200 hover:text-stone-800'
                }`}
              >
                전체 보기
              </button>
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === emotion.value}
                  onClick={() => setFilter(emotion.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === emotion.value
                      ? 'bg-stone-800 text-white'
                      : 'bg-white text-stone-500 ring-1 ring-stone-200 hover:text-stone-800'
                  }`}
                >
                  {emotion.emoji} {emotion.label}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <p>{error}</p>
                <button type="button" onClick={() => void loadDiaries(true)} className="font-semibold underline underline-offset-2">
                  다시 시도
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid min-h-64 place-items-center rounded-3xl border border-stone-200 bg-white">
                <div className="flex items-center gap-3 text-sm font-medium text-stone-500" role="status">
                  <span className="size-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
                  일기를 불러오고 있어요...
                </div>
              </div>
            ) : error && diaries.length === 0 ? null : visibleDiaries.length === 0 ? (
              <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 text-center">
                <div>
                  <span className="text-4xl" aria-hidden="true">{filter === 'all' ? '📖' : getEmotion(filter)?.emoji}</span>
                  <h3 className="mt-3 font-semibold text-stone-800">
                    {diaries.length === 0 ? '아직 기록이 없어요' : '이 감정의 기록이 아직 없어요'}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    {diaries.length === 0
                      ? '오늘의 마음을 첫 번째 일기로 남겨보세요.'
                      : '다른 감정 탭을 살펴보거나 새 일기를 작성해 보세요.'}
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-4">
                {visibleDiaries.map((diary) => {
                  const emotion = getEmotion(diary.emotion)

                  return (
                    <li key={diary.id} className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_10px_32px_-28px_rgba(70,50,40,0.3)] sm:p-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-xl ${emotion?.color ?? 'bg-stone-100 text-stone-600'}`} aria-hidden="true">
                            {emotion?.emoji ?? '📝'}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-800">{emotion?.label ?? '기록'}</p>
                            <time dateTime={diary.created_at} className="block truncate text-xs text-stone-400">
                              {formatCreatedAt(diary.created_at)}
                            </time>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="일기 삭제"
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(diary.id)}
                          className="grid size-9 shrink-0 place-items-center rounded-xl text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
                          </svg>
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-7 text-stone-700">{diary.content}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
      <footer className="border-t border-stone-200/80 px-5 py-6 text-center text-xs text-stone-400">
        마음을 기록하는 작은 습관, 마음 한 페이지
      </footer>
    </div>
  )
}

export default App
