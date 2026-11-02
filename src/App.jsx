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
  const [todayLabel] = useState(() =>
    new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date()),
  )

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
      <header className="journal-header mx-auto flex max-w-4xl items-center justify-between py-5 sm:py-6">
        <a href="./" className="flex items-center gap-3 text-inherit no-underline">
          <span className="journal-brand-mark flex size-11 items-center justify-center rounded-2xl bg-[#e8d8bc] text-2xl">
            🌼
          </span>
          <span className="text-lg font-bold tracking-tight text-[#634739]">
            마음 한 페이지
          </span>
        </a>
        <span className="hidden items-center gap-2 text-sm text-[#8f7d6a] sm:flex">
          <span aria-hidden="true">✦</span>
          오늘의 마음을 천천히 들여다봐요
        </span>
      </header>

      <main className="mx-auto max-w-4xl">
        <section className="mb-7 py-7 text-center sm:mb-9 sm:py-9">
          <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-[#9a7656]">
            A LITTLE NOTE TO MYSELF
          </p>
          <h1 className="journal-heading mb-3 text-3xl font-bold sm:text-5xl">
            오늘은 어떤 하루였나요?
          </h1>
          <p className="text-sm leading-6 text-[#8f7d6a] sm:text-base">
            작은 마음도 괜찮아요. 지금 느끼는 그대로 적어보세요.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#a28d76]">
            <span className="h-px w-8 bg-[#d7c4a8]" />
            <span aria-hidden="true">✿</span>
            <span>{todayLabel}</span>
            <span aria-hidden="true">✿</span>
            <span className="h-px w-8 bg-[#d7c4a8]" />
          </div>
        </section>

        <section
          aria-labelledby="write-heading"
          className="journal-paper entry-paper mb-10 p-5 pl-14 sm:mb-12 sm:p-8 sm:pl-16"
        >
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#987653]">
                TODAY&apos;S PAGE
              </p>
              <h2 id="write-heading" className="text-xl font-bold text-[#634739]">
                오늘의 감정 기록하기
              </h2>
            </div>
            <span className="hidden -rotate-6 rounded-sm border border-[#d6c3a5] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#a18360] sm:inline-block">
              DEAR ME
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="mb-6">
              <legend className="mb-3 text-sm font-semibold text-[#715d4c]">
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
                    className={`emotion-choice flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a684d] ${
                      selectedEmotion === emotion.value
                        ? emotionStyles[emotion.color].selected
                        : 'text-[#766657]'
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
              className="mb-2 block text-sm font-semibold text-[#715d4c]"
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
              className="entry-textarea w-full resize-y px-3 py-1 text-[15px] text-[#5b4b3e] outline-none placeholder:text-[#b2a391] focus:ring-0"
            />
            <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-h-5 text-sm text-rose-700" aria-live="polite">
                {formMessage}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="ink-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[#fffaf0] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#785642] disabled:opacity-60 sm:w-auto"
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
                  <>
                    <span aria-hidden="true">✎</span>
                    일기장에 꾹 눌러쓰기
                  </>
                )}
              </button>
            </div>
          </form>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 right-5 rotate-[-12deg] text-xl text-[#c2a883]/70"
          >
            ✿
          </span>
        </section>

        <section aria-labelledby="list-heading">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#987653]">
                LITTLE MEMORIES
              </p>
              <h2 id="list-heading" className="journal-heading text-2xl font-bold">
                차곡차곡 쌓인 마음
                {diaries && (
                  <span className="ml-2 align-middle font-sans text-sm font-medium text-[#a28d76]">
                    {diaries.length}
                  </span>
                )}
              </h2>
            </div>
            <button
              type="button"
              onClick={refreshDiaries}
              disabled={loading}
              className="self-start rounded-lg border border-[#e2d4bf] bg-[#fffaf0]/75 px-3 py-2 text-sm font-medium text-[#856d56] transition hover:bg-[#fffdf8] hover:text-[#634739] disabled:opacity-50 sm:self-auto"
            >
              ↻ 다시 펼쳐보기
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
              className={`filter-chip shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeFilter === 'all'
                  ? 'filter-chip-active'
                  : ''
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
                className={`filter-chip shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeFilter === emotion.value
                    ? 'filter-chip-active'
                    : ''
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
              className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-[#fff3ee] px-4 py-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="leading-6">{error}</p>
              <button
                type="button"
                onClick={refreshDiaries}
                disabled={loading}
                className="shrink-0 self-start rounded-lg border border-rose-200 bg-[#fffaf6] px-3 py-2 font-semibold hover:bg-rose-100 disabled:opacity-50 sm:self-auto"
              >
                다시 시도
              </button>
            </div>
          )}

          {loading && (
            <div
              role="status"
              className="journal-paper flex min-h-40 items-center justify-center gap-3 text-sm text-[#806d5b]"
            >
              <span
                className="size-5 animate-spin rounded-full border-2 border-[#eadfce] border-t-[#8a684d]"
                aria-hidden="true"
              />
              일기를 불러오는 중...
            </div>
          )}

          {!loading && diaries && filteredDiaries.length > 0 && (
            <div className="grid gap-x-5 gap-y-5 px-1 pb-2 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6">
              {filteredDiaries.map((diary) => {
                const emotion = emotions.find(
                  (item) => item.value === diary.emotion,
                )
                const style = emotion ? emotionStyles[emotion.color] : null

                return (
                  <article
                    key={diary.id}
                    className="diary-card group relative p-5 pt-7 sm:p-6 sm:pt-8"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border border-white/60 px-3 py-1.5 text-sm font-semibold ${
                          style?.badge ?? 'bg-[#f3eadc] text-[#74604e]'
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
                        className="rounded-lg px-2.5 py-1.5 text-sm text-[#a28e79] transition hover:bg-[#fff0e9] hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                    <p className="min-h-14 whitespace-pre-wrap break-words pl-2 text-[15px] leading-7 text-[#5d4c3e]">
                      {diary.content}
                    </p>
                    <time
                      dateTime={diary.created_at}
                    className="mt-5 block border-t pt-4 text-xs"
                    >
                      {formatDate(diary.created_at)}
                    </time>
                  </article>
                )
              })}
            </div>
          )}

          {!loading && !error && diaries && filteredDiaries.length === 0 && (
            <div className="paper-empty-state flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center">
              <span className="mb-3 text-4xl" aria-hidden="true">
                {activeFilter === 'all' ? '📖' : '🌿'}
              </span>
              <h3 className="mb-2 font-semibold text-[#715d4c]">
                {activeFilter === 'all'
                  ? '아직 기록이 없어요'
                  : '이 감정의 기록은 아직 없어요'}
              </h3>
              <p className="text-sm leading-6 text-[#8f7d6a]">
                {activeFilter === 'all'
                  ? '오늘의 마음을 첫 일기로 남겨보세요.'
                  : '다른 감정을 선택하거나, 새 일기를 작성해보세요.'}
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto mt-14 max-w-4xl border-t border-dashed border-[#d6c6af] pt-6 text-center text-xs text-[#9a8874]">
        <span aria-hidden="true">✦</span>
        <span className="mx-2">소중한 마음을 한 장씩 모아두어요</span>
        <span aria-hidden="true">✦</span>
      </footer>
    </div>
  )
}

export default App
