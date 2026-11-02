import { useCallback, useEffect, useState } from 'react'
import {
  createDiary,
  deleteDiary,
  fetchDiaries,
} from './api/diaries.js'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'amber' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'emerald' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'blue' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'rose' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'violet' },
]

const emotionStyles = {
  amber: {
    selected: 'border-amber-300 bg-amber-50 text-amber-800 ring-2 ring-amber-100',
    badge: 'bg-amber-50 text-amber-700',
  },
  emerald: {
    selected: 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  blue: {
    selected: 'border-blue-300 bg-blue-50 text-blue-800 ring-2 ring-blue-100',
    badge: 'bg-blue-50 text-blue-700',
  },
  rose: {
    selected: 'border-rose-300 bg-rose-50 text-rose-800 ring-2 ring-rose-100',
    badge: 'bg-rose-50 text-rose-700',
  },
  violet: {
    selected: 'border-violet-300 bg-violet-50 text-violet-800 ring-2 ring-violet-100',
    badge: 'bg-violet-50 text-violet-700',
  },
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '날짜 정보 없음'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function App() {
  const [diaries, setDiaries] = useState(null)
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const refreshDiaries = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true)
      setError('')
    }

    try {
      const entries = await fetchDiaries()
      setDiaries(entries)
    } catch (requestError) {
      setError(
        `일기를 불러오지 못했어요. ${requestError.message || '잠시 후 다시 시도해주세요.'}`,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchDiaries()
      .then((entries) => {
        if (active) setDiaries(entries)
      })
      .catch((requestError) => {
        if (active) {
          setError(
            `일기를 불러오지 못했어요. ${requestError.message || '잠시 후 다시 시도해주세요.'}`,
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setFormMessage('')

    const trimmedContent = content.trim()
    if (!selectedEmotion) {
      setFormMessage('오늘의 감정을 먼저 골라주세요.')
      return
    }
    if (!trimmedContent) {
      setFormMessage('일기 내용을 한 줄이라도 적어주세요.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion('')
      await refreshDiaries()
    } catch (requestError) {
      setError(
        `일기를 저장하지 못했어요. ${requestError.message || '잠시 후 다시 시도해주세요.'}`,
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(diary) {
    if (deleting || saving) return

    const emotion = emotions.find((item) => item.value === diary.emotion)
    const title = emotion ? `${emotion.emoji} ${emotion.label} 일기` : '이 일기'
    if (!window.confirm(`${title}를 삭제할까요? 삭제한 일기는 되돌릴 수 없어요.`)) {
      return
    }

    setDeleting(true)
    setError('')
    try {
      await deleteDiary(diary.id)
      await refreshDiaries()
    } catch (requestError) {
      setError(
        `일기를 삭제하지 못했어요. ${requestError.message || '잠시 후 다시 시도해주세요.'}`,
      )
    } finally {
      setDeleting(false)
    }
  }

  const filteredDiaries =
    diaries?.filter(
      (diary) => activeFilter === 'all' || diary.emotion === activeFilter,
    ) ?? []

  return (
    <div className="min-h-screen px-4 pb-16 sm:px-6">
      <header className="mx-auto flex max-w-5xl items-center justify-between py-6 sm:py-8">
        <a href="./" className="flex items-center gap-3 text-inherit no-underline">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
            🌱
          </span>
          <span className="text-lg font-bold tracking-tight text-stone-800">
            마음 한 페이지
          </span>
        </a>
        <span className="hidden text-sm text-stone-500 sm:block">
          오늘의 마음을 천천히 들여다봐요
        </span>
      </header>

      <main className="mx-auto max-w-5xl">
        <section className="mb-8 py-5 text-center sm:mb-10 sm:py-8">
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-emerald-700">
            MY DAILY JOURNAL
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
            오늘은 어떤 하루였나요?
          </h1>
          <p className="text-sm leading-6 text-stone-500 sm:text-base">
            작은 마음도 괜찮아요. 지금 느끼는 그대로 기록해보세요.
          </p>
        </section>

        <section
          aria-labelledby="write-heading"
          className="mb-10 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(55,65,57,0.28)] sm:mb-12 sm:p-8"
        >
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold tracking-widest text-emerald-700">
              WRITE
            </p>
            <h2 id="write-heading" className="text-xl font-bold text-stone-800">
              오늘의 감정 기록하기
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="mb-6">
              <legend className="mb-3 text-sm font-semibold text-stone-700">
                지금 기분은 어떤가요?
              </legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={selectedEmotion === emotion.value}
                    onClick={() => {
                      setSelectedEmotion(emotion.value)
                      setFormMessage('')
                    }}
                    className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                      selectedEmotion === emotion.value
                        ? emotionStyles[emotion.color].selected
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {emotion.emoji}
                    </span>
                    <span>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label
              htmlFor="diary-content"
              className="mb-3 block text-sm font-semibold text-stone-700"
            >
              오늘 있었던 일이나 마음을 적어주세요
            </label>
            <textarea
              id="diary-content"
              value={content}
              onChange={(event) => {
                setContent(event.target.value)
                setFormMessage('')
              }}
              placeholder="무슨 일이 있었나요? 어떤 마음이 들었나요?"
              rows={5}
              className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3.5 text-[15px] leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
            <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-h-5 text-sm text-rose-600" aria-live="polite">
                {formMessage}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60 sm:w-auto"
              >
                {saving ? (
                  <>
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                    저장 중...
                  </>
                ) : (
                  '일기 저장하기'
                )}
              </button>
            </div>
          </form>
        </section>

        <section aria-labelledby="list-heading">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-emerald-700">
                YOUR JOURNAL
              </p>
              <h2 id="list-heading" className="text-2xl font-bold text-stone-800">
                마음 기록
                {diaries && (
                  <span className="ml-2 align-middle text-sm font-medium text-stone-400">
                    {diaries.length}
                  </span>
                )}
              </h2>
            </div>
            <button
              type="button"
              onClick={refreshDiaries}
              disabled={loading}
              className="self-start rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-white hover:text-emerald-800 disabled:opacity-50 sm:self-auto"
            >
              새로고침
            </button>
          </div>

          <div
            role="group"
            className="mb-6 flex gap-2 overflow-x-auto pb-2"
            aria-label="감정별 일기 필터"
          >
            <button
              type="button"
              aria-pressed={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeFilter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300'
              }`}
            >
              전체 보기
            </button>
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                aria-pressed={activeFilter === emotion.value}
                onClick={() => setActiveFilter(emotion.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === emotion.value
                    ? emotionStyles[emotion.color].selected
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span aria-hidden="true">{emotion.emoji}</span>
                <span className="ml-1.5">{emotion.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="leading-6">{error}</p>
              <button
                type="button"
                onClick={refreshDiaries}
                disabled={loading}
                className="shrink-0 self-start rounded-lg border border-rose-200 bg-white px-3 py-2 font-semibold hover:bg-rose-100 disabled:opacity-50 sm:self-auto"
              >
                다시 시도
              </button>
            </div>
          )}

          {loading && (
            <div
              role="status"
              className="flex min-h-40 items-center justify-center gap-3 rounded-3xl border border-stone-200 bg-white text-sm text-stone-500"
            >
              <span
                className="size-5 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-700"
                aria-hidden="true"
              />
              일기를 불러오는 중...
            </div>
          )}

          {!loading && diaries && filteredDiaries.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredDiaries.map((diary) => {
                const emotion = emotions.find(
                  (item) => item.value === diary.emotion,
                )
                const style = emotion ? emotionStyles[emotion.color] : null

                return (
                  <article
                    key={diary.id}
                    className="group rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_10px_30px_-28px_rgba(55,65,57,0.3)] transition hover:border-stone-300 hover:shadow-[0_16px_38px_-28px_rgba(55,65,57,0.35)] sm:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                          style?.badge ?? 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        <span className="text-lg" aria-hidden="true">
                          {emotion?.emoji ?? '📝'}
                        </span>
                        {emotion?.label ?? '기록'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(diary)}
                        disabled={deleting || saving}
                        aria-label={`${emotion?.label ?? ''} 일기 삭제`}
                        className="rounded-lg px-2.5 py-1.5 text-sm text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                    <p className="min-h-14 whitespace-pre-wrap break-words text-[15px] leading-7 text-stone-700">
                      {diary.content}
                    </p>
                    <time
                      dateTime={diary.created_at}
                      className="mt-5 block border-t border-stone-100 pt-4 text-xs text-stone-400"
                    >
                      {formatDate(diary.created_at)}
                    </time>
                  </article>
                )
              })}
            </div>
          )}

          {!loading && !error && diaries && filteredDiaries.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 text-center">
              <span className="mb-3 text-4xl" aria-hidden="true">
                {activeFilter === 'all' ? '📖' : '🌿'}
              </span>
              <h3 className="mb-2 font-semibold text-stone-700">
                {activeFilter === 'all'
                  ? '아직 기록이 없어요'
                  : '이 감정의 기록은 아직 없어요'}
              </h3>
              <p className="text-sm leading-6 text-stone-500">
                {activeFilter === 'all'
                  ? '오늘의 마음을 첫 일기로 남겨보세요.'
                  : '다른 감정을 선택하거나, 새 일기를 작성해보세요.'}
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto mt-14 max-w-5xl border-t border-stone-200 pt-6 text-center text-xs text-stone-400">
        나의 기록은 안전하게, 나의 속도로
      </footer>
    </div>
  )
}

export default App
