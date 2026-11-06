import { useCallback, useEffect, useMemo, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries.js'

const EMOTIONS = [
  {
    id: 'joy',
    emoji: '😊',
    label: '기쁨',
    activeClass: 'border-[#f2c69a] bg-[#fff3e7] text-[#9b5b28]',
  },
  {
    id: 'calm',
    emoji: '😌',
    label: '평온',
    activeClass: 'border-[#b9d1c0] bg-[#edf6ef] text-[#477256]',
  },
  {
    id: 'sad',
    emoji: '😢',
    label: '슬픔',
    activeClass: 'border-[#bbcee5] bg-[#eef4fc] text-[#4c6b92]',
  },
  {
    id: 'angry',
    emoji: '😠',
    label: '화남',
    activeClass: 'border-[#efb9b1] bg-[#fff0ed] text-[#a94d41]',
  },
  {
    id: 'anxious',
    emoji: '😰',
    label: '불안',
    activeClass: 'border-[#d5c4e7] bg-[#f7f0fc] text-[#775a95]',
  },
]

const FILTERS = [{ id: 'all', label: '전체' }, ...EMOTIONS]

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const reloadDiaries = useCallback(() => {
    setIsLoading(true)
    setLoadError('')
    setRefreshKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let isCurrent = true

    fetchDiaries()
      .then((items) => {
        if (isCurrent) setDiaries(items)
      })
      .catch((error) => {
        if (isCurrent) setLoadError(getErrorMessage(error))
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [refreshKey])

  const visibleDiaries = useMemo(
    () =>
      activeFilter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === activeFilter),
    [activeFilter, diaries],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || !selectedEmotion || isSaving) return

    setIsSaving(true)
    setActionError('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion(null)
      reloadDiaries()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (deletingId !== null) return

    setDeletingId(id)
    setActionError('')

    try {
      await deleteDiary(id)
      reloadDiaries()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#292821]">
      <header className="border-b border-[#e9e4da] bg-[#fbfaf7]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a className="flex items-center gap-3" href="/" aria-label="마음 기록 홈">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#e7eee5] text-xl">
              🌿
            </span>
            <span className="text-sm font-semibold tracking-[0.12em] text-[#45463b]">
              마음 기록
            </span>
          </a>
          <span className="rounded-full border border-[#e9e4da] bg-white px-3 py-1.5 text-xs text-[#77766d]">
            오늘의 마음을 천천히
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section className="mb-9 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#8b947f]">
            A LITTLE SPACE FOR YOU
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#34352d] sm:text-4xl">
            오늘의 마음을
            <br className="sm:hidden" /> 기록해 보세요
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#77766d] sm:text-base">
            어떤 감정이든 괜찮아요. 지금 마음을 있는 그대로 남겨 보세요.
          </p>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
          <section className="rounded-3xl border border-[#ece7dd] bg-white p-5 shadow-[0_12px_40px_-30px_rgba(47,45,36,0.28)] sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-medium tracking-wide text-[#99968b]">
                마음 한 조각
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#38392f]">
                오늘은 어떤 기분인가요?
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-[#68675e]">
                  감정 선택
                </legend>
                <div className="grid grid-cols-5 gap-2">
                  {EMOTIONS.map((emotion) => {
                    const isSelected = selectedEmotion === emotion.id

                    return (
                      <button
                        key={emotion.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedEmotion(emotion.id)}
                        className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84947b] ${
                          isSelected
                            ? `${emotion.activeClass} shadow-sm`
                            : 'border-[#efede7] bg-[#fcfbf9] text-[#77766d] hover:border-[#d9d8cd] hover:bg-[#f8f7f2]'
                        }`}
                      >
                        <span className="text-2xl" aria-hidden="true">
                          {emotion.emoji}
                        </span>
                        <span className="text-[11px] font-medium sm:text-xs">
                          {emotion.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <label
                className="mb-3 mt-6 block text-sm font-medium text-[#68675e]"
                htmlFor="diary-content"
              >
                마음을 적어 보세요
              </label>
              <textarea
                id="diary-content"
                required
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="오늘 어떤 일이 있었나요? 작은 생각도 좋아요."
                rows={7}
                className="w-full resize-y rounded-2xl border border-[#e9e6de] bg-[#fcfbf9] px-4 py-3 text-sm leading-6 text-[#37372f] outline-none transition placeholder:text-[#aaa79d] focus:border-[#aab6a1] focus:ring-4 focus:ring-[#e7eee5]/70"
              />
              <p className="mt-2 text-right text-xs text-[#aaa79d]">
                {content.length}자
              </p>

              {actionError && (
                <p
                  className="mt-4 rounded-xl border border-[#f0d4ce] bg-[#fff4f1] px-4 py-3 text-sm leading-5 text-[#9b4e43]"
                  role="alert"
                >
                  {actionError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving || !content.trim() || !selectedEmotion}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#66785e] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#56694f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66785e] disabled:cursor-not-allowed disabled:bg-[#bdc4b8]"
              >
                {isSaving ? (
                  <>
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                    저장 중...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">✦</span>
                    일기 저장하기
                  </>
                )}
              </button>
            </form>
          </section>

          <section aria-labelledby="diary-list-title">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#99968b]">
                  YOUR JOURNAL
                </p>
                <h2
                  id="diary-list-title"
                  className="mt-1 text-xl font-semibold text-[#38392f]"
                >
                  마음 모아보기
                </h2>
              </div>
              <span className="pb-0.5 text-sm text-[#8c8a80]">
                {diaries.length}개의 기록
              </span>
            </div>

            <div
              className="mb-5 flex gap-2 overflow-x-auto pb-1"
              aria-label="감정별 일기 필터"
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id

                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84947b] ${
                      isActive
                        ? 'border-[#66785e] bg-[#66785e] text-white'
                        : 'border-[#e8e4da] bg-white text-[#77766d] hover:border-[#b8c2b1]'
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            {loadError && (
              <div
                className="mb-4 rounded-2xl border border-[#f0d4ce] bg-[#fff4f1] p-4 text-sm text-[#9b4e43]"
                role="alert"
              >
                <p className="leading-6">{loadError}</p>
                <button
                  type="button"
                  onClick={reloadDiaries}
                  className="mt-3 font-semibold underline underline-offset-2"
                >
                  다시 불러오기
                </button>
              </div>
            )}

            {isLoading ? (
              <div
                className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-[#ece7dd] bg-white text-sm text-[#858379]"
                role="status"
              >
                <span className="mb-3 size-6 animate-spin rounded-full border-2 border-[#dce3d8] border-t-[#66785e]" />
                일기를 불러오는 중...
              </div>
            ) : loadError ? null : visibleDiaries.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-[#dcd8ce] bg-white/70 px-6 text-center">
                <span className="mb-3 text-3xl" aria-hidden="true">
                  {activeFilter === 'all' ? '📖' : '🍃'}
                </span>
                <p className="font-medium text-[#5f5e54]">
                  {activeFilter === 'all'
                    ? '아직 기록된 일기가 없어요'
                    : '이 감정으로 작성된 일기가 없어요'}
                </p>
                <p className="mt-1.5 text-sm text-[#99968b]">
                  {activeFilter === 'all'
                    ? '첫 번째 마음을 기록해 보세요.'
                    : '다른 감정을 선택해 둘러보세요.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {visibleDiaries.map((diary) => {
                  const emotion = EMOTIONS.find(
                    (item) => item.id === diary.emotion,
                  )

                  return (
                    <li
                      key={diary.id}
                      className="rounded-3xl border border-[#ece7dd] bg-white p-5 shadow-[0_10px_30px_-28px_rgba(47,45,36,0.35)] sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f7f5ef] text-2xl">
                            {emotion?.emoji ?? '📝'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#4d4d43]">
                              {emotion?.label ?? '기록'}
                            </p>
                            <time
                              className="mt-1 block text-xs text-[#99968b]"
                              dateTime={diary.created_at}
                            >
                              {new Date(diary.created_at).toLocaleString(
                                'ko-KR',
                                {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                },
                              )}
                            </time>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`${emotion?.label ?? ''} 일기 삭제`}
                          title="일기 삭제"
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(diary.id)}
                          className="grid size-9 shrink-0 place-items-center rounded-xl text-[#aaa79d] transition hover:bg-[#fff1ee] hover:text-[#a94d41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a94d41] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === diary.id ? (
                            <span
                              className="size-4 animate-spin rounded-full border-2 border-[#efc5be] border-t-[#a94d41]"
                              aria-label="삭제 중"
                            />
                          ) : (
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="size-[18px]"
                            >
                              <path
                                d="M4.5 7h15m-10 3v7m5-7v7M6.5 7l.8 13h9.4l.8-13M9 7V4h6v3"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.6"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#5f5e55]">
                        {diary.content}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <footer className="mt-12 border-t border-[#e9e4da] pt-5 text-center text-xs text-[#aaa79d]">
          나를 돌보는 작은 습관, 오늘도 수고했어요.
        </footer>
      </div>
    </main>
  )
}

export default App
