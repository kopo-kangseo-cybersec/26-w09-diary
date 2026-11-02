import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries.js'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'bg-amber-100 text-amber-700' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'bg-teal-100 text-teal-700' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'bg-blue-100 text-blue-700' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'bg-rose-100 text-rose-700' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'bg-violet-100 text-violet-700' },
]

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const MAX_CONTENT_LENGTH = 500

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return '요청을 처리하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [filter, setFilter] = useState('all')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadDiaries = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      setDiaries(await fetchDiaries())
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    fetchDiaries()
      .then((entries) => {
        if (isCurrent) {
          setDiaries(entries)
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredDiaries = useMemo(
    () =>
      filter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === filter),
    [diaries, filter],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || !selectedEmotion || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion('')
      await loadDiaries()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('이 일기를 삭제할까요?')) {
      return
    }

    setDeletingId(id)
    setErrorMessage('')

    try {
      await deleteDiary(id)
      await loadDiaries()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-stone-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-3 text-4xl" aria-hidden="true">
            🌿
          </div>
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-teal-700">
            마음을 돌보는 작은 습관
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            오늘의 감정 일기
          </h1>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            오늘의 마음을 천천히 들여다보고 기록해 보세요.
          </p>
        </header>

        <section
          aria-labelledby="write-heading"
          className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-8"
        >
          <h2 id="write-heading" className="text-lg font-bold text-stone-900">
            지금 어떤 기분인가요?
          </h2>
          <form className="mt-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {emotions.map((emotion) => {
                const isSelected = selectedEmotion === emotion.value

                return (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:min-h-24 sm:gap-2 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden="true">
                      {emotion.emoji}
                    </span>
                    <span className="text-xs font-medium text-stone-700 sm:text-sm">
                      {emotion.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <label htmlFor="diary-content" className="sr-only">
              오늘의 일기
            </label>
            <textarea
              id="diary-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="오늘 하루는 어땠나요? 마음에 떠오르는 생각을 적어 보세요."
              rows={5}
              maxLength={MAX_CONTENT_LENGTH}
              className="mt-5 w-full resize-y rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 sm:px-5"
            />
            <div className="mt-3 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between gap-3 text-xs text-stone-400">
                <p>마음을 있는 그대로 적어도 괜찮아요.</p>
                <p aria-live="polite">
                  {content.length} / {MAX_CONTENT_LENGTH}
                </p>
              </div>
              <button
                type="submit"
                disabled={!content.trim() || !selectedEmotion || isSaving}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {isSaving ? '저장 중...' : '일기 저장하기'}
              </button>
            </div>
          </form>
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={loadDiaries}
              className="shrink-0 self-start font-semibold underline underline-offset-2 hover:text-rose-950 sm:self-auto"
            >
              다시 시도
            </button>
          </div>
        )}

        <section aria-labelledby="list-heading" className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-teal-700">
                MY JOURNAL
              </p>
              <h2 id="list-heading" className="text-2xl font-bold text-stone-900">
                나의 기록
                <span className="ml-2 text-base font-medium text-stone-400">
                  {diaries.length}
                </span>
              </h2>
            </div>
            <div
              role="group"
              aria-label="감정별 일기 필터"
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {[{ value: 'all', label: '전체' }, ...emotions].map((item) => {
                const isActive = filter === item.value

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setFilter(item.value)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:text-sm ${
                      isActive
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-stone-500 ring-1 ring-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {isLoading ? (
            <div
              role="status"
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-stone-200 bg-white text-sm text-stone-500"
            >
              <span className="size-6 animate-spin rounded-full border-2 border-teal-700/20 border-t-teal-700" />
              일기를 불러오고 있어요...
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-5 py-12 text-center">
              <div className="mb-3 text-3xl" aria-hidden="true">
                {diaries.length === 0 ? '📔' : '🍃'}
              </div>
              <p className="font-semibold text-stone-700">
                {diaries.length === 0
                  ? '아직 작성된 일기가 없어요.'
                  : '이 감정으로 작성한 일기가 없어요.'}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {diaries.length === 0
                  ? '오늘의 마음을 첫 일기로 남겨 보세요.'
                  : '다른 감정을 선택하거나 새 일기를 작성해 보세요.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredDiaries.map((diary) => {
                const emotion =
                  emotions.find((item) => item.value === diary.emotion) ?? emotions[0]

                return (
                  <li
                    key={diary.id}
                    className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-2xl ${emotion.color}`}
                        aria-label={emotion.label}
                      >
                        {emotion.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                          <span className="text-sm font-semibold text-stone-700">
                            {emotion.label}
                          </span>
                          <time
                            dateTime={diary.created_at}
                            className="text-xs text-stone-400"
                          >
                            {dateFormatter.format(new Date(diary.created_at))}
                          </time>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-stone-700">
                          {diary.content}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDelete(diary.id)}
                            disabled={deletingId !== null}
                            aria-label={`${dateFormatter.format(new Date(diary.created_at))} 일기 삭제`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-50"
                          >
                            {deletingId === diary.id ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-stone-400">
          오늘의 마음도 소중한 기록이에요.
        </footer>
      </div>
    </main>
  )
}

export default App
