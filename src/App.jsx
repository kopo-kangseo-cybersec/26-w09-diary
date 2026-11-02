import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'
import './App.css'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

const emotionMap = Object.fromEntries(
  emotions.map((emotion) => [emotion.value, emotion]),
)

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [content, setContent] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('joy')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadDiaries = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setIsLoading(true)
      setErrorMessage('')
    }

    try {
      setDiaries(await fetchDiaries())
    } catch (error) {
      setErrorMessage(error.message || '일기를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDiaries({ showLoading: false })
  }, [loadDiaries])

  const filteredDiaries = useMemo(
    () =>
      activeFilter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === activeFilter),
    [activeFilter, diaries],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      setErrorMessage('오늘의 마음을 한 줄이라도 적어 주세요.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      await loadDiaries()
    } catch (error) {
      setErrorMessage(error.message || '일기를 저장하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(diary) {
    if (!window.confirm('이 일기를 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.')) {
      return
    }

    setDeletingId(diary.id)
    setErrorMessage('')

    try {
      await deleteDiary(diary.id)
      await loadDiaries()
    } catch (error) {
      setErrorMessage(error.message || '일기를 삭제하지 못했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-4 py-8 text-stone-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-4 text-4xl" aria-hidden="true">
            🌿
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            My daily journal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            오늘의 감정 일기
          </h1>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            잠시 멈추고, 지금 마음을 천천히 들여다보세요.
          </p>
        </header>

        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_12px_40px_rgba(120,72,30,0.08)] sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-bold text-stone-900">
                지금 어떤 기분인가요?
              </h2>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={selectedEmotion === emotion.value}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`rounded-2xl border px-1 py-3 text-center transition ${
                      selectedEmotion === emotion.value
                        ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm'
                        : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-amber-200 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="block text-2xl" aria-hidden="true">
                      {emotion.emoji}
                    </span>
                    <span className="mt-1 block text-xs font-medium">
                      {emotion.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label htmlFor="diary-content" className="sr-only">
              오늘의 일기
            </label>
            <textarea
              id="diary-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요."
              rows="5"
              className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="mt-4 w-full rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {isSaving ? '저장 중...' : '일기 저장하기'}
            </button>
          </form>
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="font-bold text-red-400 hover:text-red-700"
              aria-label="오류 메시지 닫기"
            >
              ×
            </button>
          </div>
        )}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700">Your memories</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">나의 기록</h2>
            </div>
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-stone-100">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  activeFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                전체
              </button>
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  onClick={() => setActiveFilter(emotion.value)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    activeFilter === emotion.value
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {emotion.emoji} {emotion.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-stone-200 bg-white/70 px-6 py-14 text-center text-sm text-stone-500">
              <span className="mb-3 inline-block animate-pulse text-3xl" aria-hidden="true">
                ✨
              </span>
              <p>소중한 기록을 불러오는 중...</p>
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-200 bg-white/70 px-6 py-14 text-center">
              <p className="text-3xl" aria-hidden="true">
                {diaries.length === 0 ? '🌱' : '🫧'}
              </p>
              <p className="mt-3 text-sm font-semibold text-stone-700">
                {diaries.length === 0
                  ? '아직 작성된 일기가 없어요.'
                  : '이 감정으로 작성된 일기가 없어요.'}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                {diaries.length === 0
                  ? '위에서 오늘의 마음을 기록해 보세요.'
                  : '다른 감정 탭에서 기록을 찾아보세요.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDiaries.map((diary) => {
                const emotion = emotionMap[diary.emotion] || emotions[0]
                return (
                  <article
                    key={diary.id}
                    className="rounded-3xl border border-orange-100/80 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-2xl"
                          aria-label={emotion.label}
                        >
                          {emotion.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-stone-800">{emotion.label}</p>
                          <time
                            dateTime={diary.created_at}
                            className="mt-0.5 block text-xs text-stone-400"
                          >
                            {formatDate(diary.created_at)}
                          </time>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(diary)}
                        disabled={deletingId === diary.id}
                        className="rounded-lg px-2 py-1 text-xs text-stone-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-wait disabled:opacity-50"
                      >
                        {deletingId === diary.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                    <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">
                      {diary.content}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
