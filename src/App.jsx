import { useCallback, useEffect, useRef, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries.js'
import { supabaseConfigurationError } from './lib/supabase.js'

const emotions = [
  { value: 'joy', emoji: '😊', label: '기쁨', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 'calm', emoji: '😌', label: '평온', color: 'bg-sky-50 text-sky-700 ring-sky-200' },
  { value: 'sad', emoji: '😢', label: '슬픔', color: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  { value: 'angry', emoji: '😠', label: '화남', color: 'bg-rose-50 text-rose-700 ring-rose-200' },
  { value: 'anxious', emoji: '😰', label: '불안', color: 'bg-violet-50 text-violet-700 ring-violet-200' },
]

function getErrorMessage(error) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return '알 수 없는 오류가 발생했습니다.'
}

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('joy')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [validationMessage, setValidationMessage] = useState('')
  const requestId = useRef(0)

  const loadDiaries = useCallback(async () => {
    const currentRequest = ++requestId.current
    setIsLoading(true)
    setError(null)
    try {
      const entries = await fetchDiaries()
      if (currentRequest === requestId.current) setDiaries(entries)
    } catch (requestError) {
      if (currentRequest === requestId.current) {
        setError({
          title: '일기를 불러오지 못했어요.',
          detail: getErrorMessage(requestError),
        })
      }
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialRequest = ++requestId.current
    fetchDiaries()
      .then((entries) => {
        if (initialRequest === requestId.current) setDiaries(entries)
      })
      .catch((requestError) => {
        if (initialRequest === requestId.current) {
          setError({
            title: '일기를 불러오지 못했어요.',
            detail: getErrorMessage(requestError),
          })
        }
      })
      .finally(() => {
        if (initialRequest === requestId.current) setIsLoading(false)
      })

    return () => {
      if (initialRequest === requestId.current) requestId.current += 1
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setValidationMessage('오늘의 마음을 한 줄 이상 적어주세요.')
      return
    }

    setValidationMessage('')
    setError(null)
    setIsSaving(true)
    try {
      await createDiary({ content: trimmedContent, emotion })
      setContent('')
      await loadDiaries()
    } catch (requestError) {
      setError({
        title: '일기를 저장하지 못했어요.',
        detail: getErrorMessage(requestError),
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    setError(null)
    setDeletingId(id)
    try {
      await deleteDiary(id)
      await loadDiaries()
    } catch (requestError) {
      setError({
        title: '일기를 삭제하지 못했어요.',
        detail: getErrorMessage(requestError),
      })
    } finally {
      setDeletingId(null)
    }
  }

  const visibleDiaries =
    filter === 'all' ? diaries : diaries.filter((diary) => diary.emotion === filter)
  const selectedEmotion = emotions.find((item) => item.value === emotion)

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-8 text-stone-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-9 text-center sm:mb-11">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#e8eee4] text-2xl shadow-sm">
            🌿
          </div>
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-[#71816b]">
            MY LITTLE MOMENT
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-800 sm:text-4xl">
            오늘의 감정 일기
          </h1>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            오늘의 마음을 천천히 들여다보고 기록해 보세요.
          </p>
        </header>

        <section className="mb-9 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(54,63,46,0.3)] sm:mb-11 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-800">지금 어떤 기분인가요?</h2>
            <p className="mt-1 text-sm text-stone-500">오늘의 감정을 하나 골라주세요.</p>
          </div>

          <div className="mb-6 grid grid-cols-5 gap-2 sm:gap-3" aria-label="감정 선택">
            {emotions.map((item) => {
              const isSelected = emotion === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setEmotion(item.value)}
                  className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-3 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#71816b] sm:min-h-24 sm:text-sm ${
                    isSelected
                      ? `${item.color} border-transparent ring-2 ring-current`
                      : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="diary-content" className="sr-only">
              오늘의 일기
            </label>
            <textarea
              id="diary-content"
              value={content}
              onChange={(event) => {
                setContent(event.target.value)
                if (validationMessage) setValidationMessage('')
              }}
              placeholder="오늘 하루는 어땠나요? 떠오르는 생각과 감정을 자유롭게 적어보세요."
              rows={5}
              required
              aria-invalid={Boolean(validationMessage)}
              aria-describedby={validationMessage ? 'diary-validation' : undefined}
              className="w-full resize-y rounded-2xl border border-stone-200 bg-[#fcfcfa] px-4 py-4 text-sm leading-7 text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-[#9aaa91] focus:ring-4 focus:ring-[#e8eee4] sm:text-base"
            />
            {validationMessage && (
              <p id="diary-validation" className="mt-2 text-sm text-rose-600" role="alert">
                {validationMessage}
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500">
                선택한 감정 <span className="ml-1">{selectedEmotion.emoji} {selectedEmotion.label}</span>
              </p>
              <button
                type="submit"
                disabled={isSaving || Boolean(supabaseConfigurationError)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#71816b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5e6e58] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#71816b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? '저장 중...' : '일기 저장하기'}
                {!isSaving && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
        </section>

        <section aria-labelledby="diary-list-heading">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 id="diary-list-heading" className="text-xl font-semibold text-stone-800">
                나의 기록
              </h2>
              <p className="mt-1 text-sm text-stone-500">차곡차곡 쌓이는 오늘의 마음</p>
            </div>
            <button
              type="button"
              onClick={loadDiaries}
              disabled={isLoading}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#71816b] transition hover:bg-[#e8eee4] disabled:cursor-wait disabled:opacity-60"
            >
              다시 불러오기
            </button>
          </div>

          {error && (
            <div
              className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800"
              role="alert"
            >
              <p className="font-semibold">{error.title}</p>
              <p className="mt-1 break-words text-rose-700">{error.detail}</p>
              {supabaseConfigurationError && (
                <p className="mt-2 text-rose-700">
                  `.env.local`에 Supabase URL과 Publishable Key를 설정하고 개발 서버를 다시 시작해 주세요.
                </p>
              )}
            </div>
          )}

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="감정별 필터">
            {[
              { value: 'all', label: '전체 보기', emoji: '✦' },
              ...emotions.map((item) => ({
                value: item.value,
                label: item.label,
                emoji: item.emoji,
              })),
            ].map((item) => {
              const isSelected = filter === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setFilter(item.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-[#71816b] text-white shadow-sm'
                      : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="mr-1.5" aria-hidden="true">{item.emoji}</span>
                  {item.label}
                </button>
              )
            })}
          </div>

          {isLoading ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white text-stone-500">
              <span
                className="mb-3 size-7 animate-spin rounded-full border-2 border-[#dce4d7] border-t-[#71816b]"
                aria-hidden="true"
              />
              <p role="status">일기를 불러오고 있어요...</p>
            </div>
          ) : error && diaries.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white px-6 text-center">
              <span className="mb-3 text-3xl" aria-hidden="true">📝</span>
              <p className="font-semibold text-stone-700">기록을 표시할 수 없어요</p>
              <p className="mt-2 text-sm text-stone-500">
                연결을 확인한 다음 다시 불러와 주세요.
              </p>
              <button
                type="button"
                onClick={loadDiaries}
                className="mt-4 rounded-lg bg-[#71816b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5e6e58]"
              >
                다시 시도
              </button>
            </div>
          ) : visibleDiaries.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 text-center">
              <span className="mb-3 text-4xl" aria-hidden="true">
                {filter === 'all' ? '📔' : '🌱'}
              </span>
              <h3 className="font-semibold text-stone-700">
                {filter === 'all' ? '아직 기록이 없어요' : '이 감정의 기록이 아직 없어요'}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
                {filter === 'all'
                  ? '오늘의 감정을 첫 일기로 남겨보세요. 작은 기록이 나를 알아가는 시작이 될 거예요.'
                  : '다른 감정 탭을 살펴보거나, 지금 느끼는 마음을 새 일기로 기록해 보세요.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {visibleDiaries.map((diary) => {
                const diaryEmotion = emotions.find((item) => item.value === diary.emotion)
                return (
                  <li
                    key={diary.id}
                    className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(54,63,46,0.35)] sm:p-6"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                            diaryEmotion?.color ?? 'bg-stone-100 text-stone-600'
                          }`}
                          aria-label={diaryEmotion?.label ?? '감정'}
                        >
                          {diaryEmotion?.emoji ?? '💭'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-stone-700">
                            {diaryEmotion?.label ?? '감정'}
                          </p>
                          <time
                            className="mt-0.5 block text-xs text-stone-400"
                            dateTime={diary.created_at}
                          >
                            {formatCreatedAt(diary.created_at)}
                          </time>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(diary.id)}
                        disabled={deletingId !== null || Boolean(supabaseConfigurationError)}
                        aria-label={`${formatCreatedAt(diary.created_at)} 일기 삭제`}
                        className="shrink-0 rounded-lg px-3 py-2 text-sm text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === diary.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-stone-700 sm:text-base">
                      {diary.content}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <footer className="py-10 text-center text-xs text-stone-400">
          오늘의 마음도 소중한 나의 일부예요.
        </footer>
      </div>
    </main>
  )
}

export default App
