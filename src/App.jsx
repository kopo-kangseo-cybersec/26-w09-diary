import { useCallback, useEffect, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries.js'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', active: 'border-amber-300 bg-amber-50 text-amber-800' },
  { value: 'calm', label: '평온', emoji: '😌', active: 'border-teal-300 bg-teal-50 text-teal-800' },
  { value: 'sad', label: '슬픔', emoji: '😢', active: 'border-sky-300 bg-sky-50 text-sky-800' },
  { value: 'angry', label: '화남', emoji: '😠', active: 'border-rose-300 bg-rose-50 text-rose-800' },
  { value: 'anxious', label: '불안', emoji: '😰', active: 'border-violet-300 bg-violet-50 text-violet-800' },
]

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refreshDiaries = useCallback(async () => {
    try {
      const records = await fetchDiaries()
      setDiaries(records)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '일기를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    fetchDiaries()
      .then((records) => {
        if (isCurrent) setDiaries(records)
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : '일기를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const visibleDiaries = activeFilter === 'all'
    ? diaries
    : diaries.filter((diary) => diary.emotion === activeFilter)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || !selectedEmotion) return

    setIsSaving(true)
    setError('')
    setNotice('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion('')
      setNotice('오늘의 마음을 기록했어요.')
      setIsLoading(true)
      await refreshDiaries()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '일기를 저장하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setError('')
    setNotice('')

    try {
      await deleteDiary(id)
      setNotice('일기를 삭제했어요.')
      setIsLoading(true)
      await refreshDiaries()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '일기를 삭제하지 못했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-slate-800">
      <header className="border-b border-[#e9e7df] bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center gap-3 text-slate-900 no-underline">
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-xl" aria-hidden="true">🌱</span>
            <span>
              <span className="block text-lg font-bold tracking-tight">마음 일기</span>
              <span className="block text-xs text-slate-500">오늘의 나를 다정하게 기록해요</span>
            </span>
          </a>
          <span className="hidden rounded-full bg-[#f7f6f2] px-4 py-2 text-sm text-slate-500 sm:block">
            나의 작은 기록장
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold tracking-wide text-emerald-700">A LITTLE SPACE FOR YOU</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">오늘 마음은 어땠나요?</h1>
          <p className="mt-3 leading-7 text-slate-600">
            잘 정리되지 않아도 괜찮아요. 지금 느끼는 감정과 생각을 편하게 남겨보세요.
          </p>
        </section>

        {(error || notice) && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
            role={error ? 'alert' : 'status'}
          >
            {error || notice}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.4fr)]">
          <section className="rounded-3xl border border-[#eeece5] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">오늘의 마음 남기기</h2>
              <p className="mt-1 text-sm text-slate-500">가장 가까운 감정을 골라주세요.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-700">지금 느끼는 감정</legend>
                <div className="grid grid-cols-5 gap-2">
                  {emotions.map((emotion) => {
                    const isSelected = selectedEmotion === emotion.value

                    return (
                      <button
                        key={emotion.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedEmotion(emotion.value)}
                        className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl border px-1 py-3 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:px-2 ${
                          isSelected
                            ? `${emotion.active} font-semibold shadow-sm`
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl" aria-hidden="true">{emotion.emoji}</span>
                        <span>{emotion.label}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <label htmlFor="diary-content" className="mb-2 mt-6 block text-sm font-semibold text-slate-700">
                오늘의 이야기
              </label>
              <textarea
                id="diary-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={2000}
                rows={7}
                placeholder="무슨 일이 있었나요? 어떤 마음이 들었나요?"
                className="w-full resize-y rounded-2xl border border-slate-200 bg-[#fdfdfc] px-4 py-3 leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>같은 Supabase 프로젝트를 사용하는 기기에서 확인할 수 있어요.</span>
                <span>{content.length}/2000</span>
              </div>

              <button
                type="submit"
                disabled={isSaving || !content.trim() || !selectedEmotion}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
              >
                {isSaving && (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                )}
                {isSaving ? '저장 중...' : '일기 저장하기'}
              </button>
            </form>
          </section>

          <section aria-labelledby="diary-list-title">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500">차곡차곡 쌓이는 마음</p>
                <h2 id="diary-list-title" className="text-2xl font-bold text-slate-900">나의 일기</h2>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
                {diaries.length}개의 기록
              </span>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="감정별 일기 필터">
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                전체 보기
              </button>
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === emotion.value}
                  onClick={() => setActiveFilter(emotion.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === emotion.value
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span aria-hidden="true">{emotion.emoji}</span> {emotion.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 text-slate-500" role="status">
                <span className="mb-3 size-7 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" aria-hidden="true" />
                일기를 불러오는 중...
              </div>
            ) : visibleDiaries.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 text-center">
                <span className="mb-3 text-4xl" aria-hidden="true">{activeFilter === 'all' ? '📔' : '🍃'}</span>
                <p className="font-semibold text-slate-800">
                  {activeFilter === 'all' ? '아직 작성된 일기가 없어요.' : '이 감정으로 남긴 일기가 없어요.'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {activeFilter === 'all' ? '오늘의 마음을 첫 기록으로 남겨보세요.' : '다른 감정 탭도 살펴보세요.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleDiaries.map((diary) => {
                  const emotion = emotions.find((item) => item.value === diary.emotion)

                  return (
                    <article key={diary.id} className="rounded-3xl border border-[#eeece5] bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f7f6f2] text-2xl" aria-hidden="true">
                            {emotion?.emoji || '💭'}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{emotion?.label || '감정 기록'}</p>
                            <time className="mt-0.5 block text-xs text-slate-500" dateTime={diary.created_at}>
                              {dateFormatter.format(new Date(diary.created_at))}
                            </time>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="일기 삭제"
                          disabled={deletingId === diary.id}
                          onClick={() => void handleDelete(diary.id)}
                          className="shrink-0 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-wait disabled:opacity-50"
                        >
                          {deletingId === diary.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-7 text-slate-700">{diary.content}</p>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#e9e7df] px-5 py-6 text-center text-xs text-slate-500">
        오늘의 마음도 소중한 나의 일부예요.
      </footer>
    </div>
  )
}

export default App
