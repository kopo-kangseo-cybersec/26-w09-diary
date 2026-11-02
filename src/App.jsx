import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, getDiaries } from './api/diaries.js'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'bg-amber-100 text-amber-800 ring-amber-200' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'bg-sky-100 text-sky-800 ring-sky-200' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'bg-rose-100 text-rose-800 ring-rose-200' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'bg-violet-100 text-violet-800 ring-violet-200' },
]

const allFilter = { value: 'all', label: '전체' }

function getEmotion(value) {
  return emotions.find((emotion) => emotion.value === value) ?? {
    label: '기록',
    emoji: '💭',
    color: 'bg-stone-100 text-stone-700 ring-stone-200',
  }
}

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '날짜를 확인할 수 없어요'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [content, setContent] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const fetchDiaries = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      setDiaries(await getDiaries())
    } catch (fetchError) {
      setError(fetchError.message || '일기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getDiaries()
      .then((entries) => {
        if (isCurrent) {
          setDiaries(entries)
        }
      })
      .catch((fetchError) => {
        if (isCurrent) {
          setError(fetchError.message || '일기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
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
    () => activeFilter === 'all'
      ? diaries
      : diaries.filter((diary) => diary.emotion === activeFilter),
    [activeFilter, diaries],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || !selectedEmotion || isSaving) {
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion('')
      await fetchDiaries()
    } catch (saveError) {
      setError(saveError.message || '일기를 저장하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (deletingId !== null) {
      return
    }

    setDeletingId(id)
    setError('')

    try {
      await deleteDiary(id)
      await fetchDiaries()
    } catch (deleteError) {
      setError(deleteError.message || '일기를 삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-3xl shadow-sm shadow-violet-100">
            🌱
          </div>
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-violet-600">오늘의 마음을 기록해요</p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">마음 일기</h1>
          <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base">
            어떤 하루였든 괜찮아요. 지금의 마음을 천천히 들여다봐요.
          </p>
        </header>

        <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(74,54,112,0.28)] sm:p-8">
          <div className="mb-6">
            <p className="text-lg font-semibold text-stone-800">지금 기분은 어떤가요?</p>
            <p className="mt-1 text-sm text-stone-500">오늘의 감정을 하나 골라주세요.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-5 gap-2 sm:gap-3" role="group" aria-label="오늘의 감정">
              {emotions.map((emotion) => {
                const isSelected = selectedEmotion === emotion.value

                return (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-3 text-xs font-medium transition hover:-translate-y-0.5 sm:min-h-24 sm:text-sm ${
                      isSelected
                        ? `${emotion.color} border-transparent ring-2 ring-violet-400 ring-offset-2`
                        : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-violet-200 hover:bg-violet-50'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden="true">{emotion.emoji}</span>
                    <span>{emotion.label}</span>
                  </button>
                )
              })}
            </div>

            <label htmlFor="diary-content" className="mb-2 block text-sm font-semibold text-stone-700">
              오늘의 이야기
            </label>
            <textarea
              id="diary-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="오늘 어떤 일이 있었나요? 마음에 떠오르는 생각을 편하게 적어보세요."
              rows={5}
              maxLength={5000}
              required
              className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3.5 text-sm leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-stone-400">
                {content.length.toLocaleString('ko-KR')} / 5,000
                {!selectedEmotion && <span className="ml-2">· 감정을 선택해 주세요</span>}
              </p>
              <button
                type="submit"
                disabled={isSaving || !content.trim() || !selectedEmotion}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-violet-300"
              >
                {isSaving ? '저장 중...' : '일기 저장하기'}
                {!isSaving && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10 sm:mt-12" aria-labelledby="diary-list-title">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-violet-500">나의 기록</p>
              <h2 id="diary-list-title" className="text-2xl font-bold tracking-tight text-stone-900">마음이 머문 순간</h2>
            </div>
            <span className="text-sm text-stone-500">
              {diaries.length === 1 ? '일기 1개' : `일기 ${diaries.length}개`}
            </span>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="감정별 일기 필터">
            {[allFilter, ...emotions].map((filter) => {
              const isActive = activeFilter === filter.value

              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'border border-stone-200 bg-white text-stone-600 hover:border-violet-200 hover:text-violet-700'
                  }`}
                >
                  {filter.value === 'all' ? filter.label : `${filter.emoji} ${filter.label}`}
                </button>
              )
            })}
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm leading-6 text-rose-800">
              <span aria-hidden="true">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-stone-100 bg-white text-sm text-stone-500">
              <span className="size-7 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" aria-hidden="true" />
              <span role="status">일기를 불러오는 중이에요...</span>
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white px-6 text-center">
              <span className="mb-3 text-4xl" aria-hidden="true">{diaries.length === 0 ? '📔' : '🔎'}</span>
              <p className="font-semibold text-stone-700">
                {diaries.length === 0 ? '아직 작성된 일기가 없어요' : '이 감정으로 남긴 일기가 없어요'}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {diaries.length === 0 ? '오늘의 마음을 첫 번째 일기로 남겨보세요.' : '다른 감정 탭도 살펴보세요.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDiaries.map((diary) => {
                const emotion = getEmotion(diary.emotion)

                return (
                  <article key={diary.id} className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm shadow-stone-200/40 transition hover:border-violet-100 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 ${emotion.color}`} aria-hidden="true">
                          {emotion.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800">{emotion.label}의 마음</p>
                          <time className="mt-0.5 block text-xs text-stone-400 sm:text-sm" dateTime={diary.created_at}>
                            {formatDate(diary.created_at)}
                          </time>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDelete(diary.id)}
                        disabled={deletingId !== null}
                        aria-label={`${formatDate(diary.created_at)} 일기 삭제`}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === diary.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-stone-700">{diary.content}</p>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-stone-400">
          오늘의 마음도 소중한 기록이에요.
        </footer>
      </div>
    </main>
  )
}

export default App
