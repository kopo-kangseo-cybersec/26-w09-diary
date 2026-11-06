import { useCallback, useEffect, useState } from 'react'
import { createDiary, deleteDiary, getDiaries } from './api/diaries.js'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'bg-amber-100 text-amber-800 ring-amber-300' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'bg-teal-100 text-teal-800 ring-teal-300' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'bg-sky-100 text-sky-800 ring-sky-300' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'bg-rose-100 text-rose-800 ring-rose-300' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'bg-violet-100 text-violet-800 ring-violet-300' },
]

const filters = [{ value: 'all', label: '전체' }, ...emotions.map(({ value, label }) => ({ value, label }))]

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [emotion, setEmotion] = useState('joy')
  const [content, setContent] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const refreshDiaries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setDiaries(await getDiaries())
    } catch (loadError) {
      setError(loadError.message || '일기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getDiaries()
      .then((result) => {
        if (active) setDiaries(result)
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || '일기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent || saving) return

    setSaving(true)
    setError('')
    try {
      await createDiary({ content: trimmedContent, emotion })
      setContent('')
      await refreshDiaries()
    } catch (saveError) {
      setError(saveError.message || '일기를 저장하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    setError('')
    try {
      await deleteDiary(id)
      await refreshDiaries()
    } catch (deleteError) {
      setError(deleteError.message || '일기를 삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setDeletingId(null)
    }
  }

  const visibleDiaries = activeFilter === 'all'
    ? diaries
    : diaries.filter((diary) => diary.emotion === activeFilter)

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 pb-16 text-slate-800 sm:px-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between py-5">
        <a href="#" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-700" aria-label="마음기록 홈">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-lg text-white">ღ</span>
          마음기록
        </a>
        <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs text-slate-500">
          나를 위한 작은 기록
        </span>
      </header>

      <section className="mx-auto max-w-3xl pt-7 sm:pt-12">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-teal-700">A MOMENT WITH YOURSELF</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">오늘의 마음을 기록해요</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">어떤 감정이든 괜찮아요. 지금 느끼는 그대로 적어보세요.</p>
        </div>

        <form onSubmit={handleSave} className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(47,73,66,0.28)] sm:p-8">
          <fieldset>
            <legend className="mb-4 text-sm font-semibold text-slate-700">지금 어떤 기분인가요?</legend>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {emotions.map((item) => {
                const selected = emotion === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setEmotion(item.value)}
                    className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-3 transition hover:-translate-y-0.5 sm:min-h-24 ${
                      selected
                        ? `border-transparent ${item.color} ring-2 ring-offset-2`
                        : 'border-stone-200 bg-stone-50/60 text-slate-600 hover:border-teal-200 hover:bg-teal-50/60'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden="true">{item.emoji}</span>
                    <span className="text-xs font-medium sm:text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <label htmlFor="diary-content" className="mb-2 mt-7 block text-sm font-semibold text-slate-700">오늘의 이야기</label>
          <textarea
            id="diary-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="오늘 하루는 어땠나요? 마음에 남은 순간을 적어보세요."
            maxLength={5000}
            rows={5}
            required
            className="w-full resize-y rounded-2xl border border-stone-200 bg-[#fcfcfa] px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          />
          <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-right text-xs text-slate-400 sm:text-left">{content.length} / 5,000</span>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? '저장 중...' : '기록 저장하기'}
              {!saving && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>

        <section className="mt-12" aria-labelledby="diary-list-heading">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-teal-700">YOUR JOURNAL</p>
              <h2 id="diary-list-heading" className="text-xl font-semibold text-slate-900">마음 모아보기</h2>
            </div>
            <button
              type="button"
              onClick={refreshDiaries}
              disabled={loading}
              className="self-start rounded-lg px-2 py-1 text-xs font-medium text-slate-500 underline decoration-stone-300 underline-offset-4 hover:text-teal-700 disabled:opacity-50 sm:self-auto"
            >
              새로고침
            </button>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="감정별 일기 필터">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter.value
                    ? 'bg-slate-800 text-white'
                    : 'border border-stone-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
              <p>{error}</p>
              <button type="button" onClick={refreshDiaries} className="shrink-0 font-semibold underline underline-offset-2">다시 시도</button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-stone-200 bg-white text-sm text-slate-500" role="status">
              <span className="size-7 animate-spin rounded-full border-2 border-teal-100 border-t-teal-700" aria-hidden="true" />
              일기를 불러오고 있어요...
            </div>
          ) : error && diaries.length === 0 ? null : visibleDiaries.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 text-center">
              <span className="mb-3 text-3xl" aria-hidden="true">{diaries.length === 0 ? '🌱' : '🍃'}</span>
              <p className="font-semibold text-slate-700">
                {diaries.length === 0 ? '아직 기록이 없어요' : '이 감정으로 작성한 일기가 없어요'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {diaries.length === 0 ? '첫 번째 마음을 기록해보세요.' : '다른 감정 탭을 선택해보세요.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleDiaries.map((diary) => {
                const diaryEmotion = emotions.find((item) => item.value === diary.emotion)
                return (
                  <li key={diary.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(47,73,66,0.35)] sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-xl ${diaryEmotion?.color ?? 'bg-stone-100'}`} aria-label={diaryEmotion?.label ?? diary.emotion}>
                          {diaryEmotion?.emoji ?? '📝'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700">{diaryEmotion?.label ?? diary.emotion}</p>
                          <time dateTime={diary.created_at} className="block text-xs text-slate-400">{formatCreatedAt(diary.created_at)}</time>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(diary.id)}
                        disabled={deletingId === diary.id}
                        aria-label={`${formatCreatedAt(diary.created_at)} 일기 삭제`}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                      >
                        {deletingId === diary.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{diary.content}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-slate-400">
          오늘의 마음도 소중한 나의 일부예요.
        </footer>
      </section>
    </main>
  )
}

export default App
