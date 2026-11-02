import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createDiary, deleteDiary, getDiaries } from './api/diaries.js'
import PixelEmotion from './components/PixelEmotion.jsx'
import './retro.css'

const emotions = [
  { value: 'joy', label: '기쁨', color: 'retro-emotion-joy' },
  { value: 'calm', label: '평온', color: 'retro-emotion-calm' },
  { value: 'sad', label: '슬픔', color: 'retro-emotion-sad' },
  { value: 'angry', label: '화남', color: 'retro-emotion-angry' },
  { value: 'anxious', label: '불안', color: 'retro-emotion-anxious' },
]

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
const todayLabel = dateFormatter.format(new Date())
const taskbarTime = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date())

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState('joy')
  const [activeFilter, setActiveFilter] = useState('all')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [windowPositions, setWindowPositions] = useState({})
  const [draggingWindow, setDraggingWindow] = useState(null)
  const [blueScreenDismissedFor, setBlueScreenDismissedFor] = useState(null)
  const composeWindowRef = useRef(null)
  const listWindowRef = useRef(null)
  const diaryInputRef = useRef(null)
  const dragStateRef = useRef(null)

  const distressedDiaryCount = useMemo(
    () => diaries.filter((diary) => ['angry', 'anxious'].includes(diary.emotion)).length,
    [diaries],
  )
  const distressedDiarySignature = useMemo(
    () =>
      diaries
        .filter((diary) => ['angry', 'anxious'].includes(diary.emotion))
        .map((diary) => diary.id)
        .sort()
        .join(','),
    [diaries],
  )
  const showBlueScreen =
    distressedDiaryCount >= 5 &&
    blueScreenDismissedFor !== distressedDiarySignature

  useEffect(() => {
    if (!showBlueScreen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setBlueScreenDismissedFor(distressedDiarySignature)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [distressedDiarySignature, showBlueScreen])

  const handleWindowPointerDown = (windowName, event) => {
    if (event.button !== 0) return
    const currentPosition = windowPositions[windowName] ?? { x: 0, y: 0 }
    dragStateRef.current = {
      windowName,
      startX: event.clientX,
      startY: event.clientY,
      originX: currentPosition.x,
      originY: currentPosition.y,
    }
    setDraggingWindow(windowName)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleWindowPointerMove = (event) => {
    const dragState = dragStateRef.current
    if (!dragState) return

    setWindowPositions((positions) => ({
      ...positions,
      [dragState.windowName]: {
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      },
    }))
  }

  const handleWindowPointerUp = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragStateRef.current = null
    setDraggingWindow(null)
  }

  const focusComposer = () => {
    setIsStartMenuOpen(false)
    composeWindowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    diaryInputRef.current?.focus({ preventScroll: true })
  }

  const focusDiaryList = () => {
    setIsStartMenuOpen(false)
    listWindowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const loadDiaries = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true)
      setError('')
    }

    try {
      setDiaries(await getDiaries())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : '일기를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    getDiaries()
      .then((loadedDiaries) => {
        if (isMounted) setDiaries(loadedDiaries)
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : '일기를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          )
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const visibleDiaries = useMemo(
    () =>
      activeFilter === 'all'
        ? diaries
        : diaries.filter((diary) => diary.emotion === activeFilter),
    [activeFilter, diaries],
  )

  const submitDiary = async (event) => {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent || isSaving) return

    setIsSaving(true)
    setError('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      await loadDiaries()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : '일기를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const removeDiary = async (diary) => {
    if (!window.confirm('이 일기를 삭제할까요? 삭제한 일기는 되돌릴 수 없어요.')) {
      return
    }

    setDeletingId(diary.id)
    setError('')

    try {
      await deleteDiary(diary.id)
      await loadDiaries()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : '일기를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="retro-desktop min-h-screen">
      <header className="retro-topbar">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center gap-3 no-underline">
            <span className="retro-brand-icon grid size-10 place-items-center">
              <PixelEmotion emotion="calm" className="size-7" />
            </span>
            <span className="text-lg font-bold tracking-tight">마음의 기록</span>
          </a>
          <span className="retro-header-hint hidden text-sm sm:block">
            감정 일기.exe
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-9 sm:px-8 sm:pt-14">
        <section className="mb-9 text-center sm:mb-12">
          <p className="retro-eyebrow mb-3 text-sm font-semibold tracking-wide">
            WELCOME TO MY DIARY
          </p>
          <h1 className="retro-main-title text-3xl font-bold tracking-tight sm:text-4xl">
            오늘의 마음을 기록해요
          </h1>
          <p className="retro-subtitle mt-3 text-sm sm:text-base">
            정답은 없어요. 지금 느끼는 그대로 적어보세요.
          </p>
          <p className="retro-date mt-5 text-sm font-medium">
            {todayLabel}
          </p>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] lg:gap-10">
          <section
            ref={composeWindowRef}
            className="retro-window retro-compose-window p-5 sm:p-7"
            style={{
              transform: `translate(${windowPositions.compose?.x ?? 0}px, ${windowPositions.compose?.y ?? 0}px)`,
            }}
            data-dragging={draggingWindow === 'compose'}
          >
            <div
              className="retro-window-titlebar"
              onPointerDown={(event) => handleWindowPointerDown('compose', event)}
              onPointerMove={handleWindowPointerMove}
              onPointerUp={handleWindowPointerUp}
              onPointerCancel={handleWindowPointerUp}
            >
              <span>새 일기 작성</span>
              <span className="retro-window-controls" aria-hidden="true">
                <i>_</i><i>□</i><i>×</i>
              </span>
            </div>
            <div className="mb-6">
              <p className="retro-window-kicker text-xs font-bold uppercase tracking-[0.18em]">
                WRITE A DIARY
              </p>
              <h2 className="mt-2 text-xl font-bold">
                지금 기분은 어떤가요?
              </h2>
            </div>

            <form onSubmit={submitDiary}>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">
                  오늘의 감정
                </legend>
                <div className="grid grid-cols-5 gap-2">
                  {emotions.map((emotion) => {
                    const isSelected = selectedEmotion === emotion.value
                    return (
                      <button
                        key={emotion.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedEmotion(emotion.value)}
                        className={`retro-button flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                          isSelected
                            ? 'border-emerald-700 bg-[#edf3eb] text-emerald-950'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <PixelEmotion emotion={emotion.value} className="size-8" />
                        <span className="text-xs font-medium">{emotion.label}</span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <label
                htmlFor="diary-content"
                className="mb-3 mt-6 block text-sm font-semibold"
              >
                마음을 적어주세요
              </label>
              <textarea
                ref={diaryInputRef}
                id="diary-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="오늘 어떤 일이 있었나요? 어떤 마음이 들었나요?"
                rows={7}
                className="retro-textarea w-full resize-y rounded-2xl border border-stone-200 bg-[#fdfcf9] px-4 py-3.5 text-sm leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />
              <button
                type="submit"
                disabled={isSaving || !content.trim()}
                className="retro-button retro-save-button mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                <span aria-hidden="true">{isSaving ? '' : '✍️'}</span>
                {isSaving ? '저장 중...' : '일기 저장하기'}
              </button>
            </form>
          </section>

          <section
            ref={listWindowRef}
            className="retro-window retro-list-window"
            aria-labelledby="diary-list-title"
            style={{
              transform: `translate(${windowPositions.list?.x ?? 0}px, ${windowPositions.list?.y ?? 0}px)`,
            }}
            data-dragging={draggingWindow === 'list'}
          >
            <div
              className="retro-window-titlebar"
              onPointerDown={(event) => handleWindowPointerDown('list', event)}
              onPointerMove={handleWindowPointerMove}
              onPointerUp={handleWindowPointerUp}
              onPointerCancel={handleWindowPointerUp}
            >
              <span>나의 기록</span>
              <span className="retro-window-controls" aria-hidden="true">
                <i>_</i><i>□</i><i>×</i>
              </span>
            </div>
            <div className="retro-list-content">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="retro-window-kicker text-xs font-bold uppercase tracking-[0.18em]">
                  MY DIARY
                </p>
                <h2
                  id="diary-list-title"
                  className="mt-2 text-xl font-bold"
                >
                  나의 기록
                  <span className="retro-count ml-2 text-sm font-medium">
                    {diaries.length}
                  </span>
                </h2>
              </div>
              <span className="retro-hint text-xs">최신 기록부터 보여드려요</span>
            </div>

            <div
              className="mb-5 flex gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="감정별 일기 필터"
            >
              <button
                type="button"
                aria-pressed={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                className={`retro-button shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeFilter === 'all'
                    ? 'bg-emerald-900 text-white'
                    : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
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
                  className={`retro-button shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === emotion.value
                      ? 'bg-emerald-900 text-white'
                      : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <PixelEmotion emotion={emotion.value} className="mr-1 inline-block size-4 align-middle" />
                  {emotion.label}
                </button>
              ))}
            </div>

            {error && (
              <div
                role="alert"
                className="retro-error mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => void loadDiaries(true)}
                  className="retro-link shrink-0 font-semibold underline underline-offset-2"
                >
                  다시 불러오기
                </button>
              </div>
            )}

            {isLoading ? (
              <div
                className="retro-empty grid min-h-56 place-items-center rounded-3xl border border-stone-200 bg-white p-8 text-center"
                role="status"
              >
                <div>
                  <span className="mx-auto mb-3 block size-8 animate-spin rounded-full border-2 border-stone-200 border-t-emerald-800" />
                  <p className="text-sm">일기를 불러오고 있어요...</p>
                </div>
              </div>
            ) : visibleDiaries.length > 0 ? (
              <div className="space-y-4">
                {visibleDiaries.map((diary) => {
                  const emotion = emotions.find(
                    (item) => item.value === diary.emotion,
                  )

                  return (
                    <article
                      key={diary.id}
                      className="retro-diary-card rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_40px_-32px_rgba(70,55,30,0.3)] sm:p-6"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`grid size-10 place-items-center rounded-2xl text-xl ${
                              emotion?.color ?? 'bg-stone-100'
                            }`}
                            aria-hidden="true"
                          >
                            <PixelEmotion emotion={emotion?.value ?? 'calm'} className="size-8" />
                          </span>
                          <span className="text-sm font-semibold">
                            {emotion?.label ?? '기록'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeDiary(diary)}
                          disabled={deletingId === diary.id}
                          aria-label={`${dateTimeFormatter.format(new Date(diary.created_at))} 일기 삭제`}
                          className="retro-button retro-delete-button rounded-xl px-3 py-2 text-xs font-medium text-stone-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:cursor-wait disabled:opacity-50"
                        >
                          {deletingId === diary.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                      <p className="retro-diary-text whitespace-pre-wrap break-words text-sm leading-7 text-stone-700">
                        {diary.content}
                      </p>
                      <time
                        dateTime={diary.created_at}
                        className="retro-hint mt-5 block text-xs"
                      >
                        {dateTimeFormatter.format(new Date(diary.created_at))}
                      </time>
                    </article>
                  )
                })}
              </div>
            ) : error ? null : (
              <div className="retro-empty grid min-h-56 place-items-center rounded-3xl border border-dashed border-stone-300 bg-white/70 p-8 text-center">
                <div>
                  <PixelEmotion
                    emotion={activeFilter === 'all' ? 'calm' : activeFilter}
                    className="mx-auto mb-3 size-10"
                  />
                  <p className="font-semibold">
                    {activeFilter === 'all'
                      ? '아직 기록이 없어요'
                      : '이 감정으로 남긴 일기가 없어요'}
                  </p>
                  <p className="retro-hint mt-2 text-sm">
                    {activeFilter === 'all'
                      ? '오늘의 마음을 첫 일기로 남겨보세요.'
                      : '다른 감정을 선택하거나 새 일기를 작성해 보세요.'}
                  </p>
                </div>
              </div>
            )}
            </div>
          </section>
        </div>
      </main>

      <footer className="retro-taskbar" aria-label="작업 표시줄">
        {isStartMenuOpen && (
          <div className="retro-start-menu" role="menu" aria-label="시작 메뉴">
            <div className="retro-start-menu-banner">
              <strong>마음의 기록</strong>
              <span>16-bit diary</span>
            </div>
            <button type="button" role="menuitem" onClick={focusComposer}>
              <span aria-hidden="true">✎</span>
              새 일기 작성
            </button>
            <button type="button" role="menuitem" onClick={focusDiaryList}>
              <span aria-hidden="true">▤</span>
              나의 기록 보기
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsStartMenuOpen(false)
                void loadDiaries(true)
              }}
            >
              <span aria-hidden="true">↻</span>
              목록 새로고침
            </button>
          </div>
        )}
        <button
          type="button"
          className="retro-start-button"
          aria-expanded={isStartMenuOpen}
          aria-haspopup="menu"
          onClick={() => setIsStartMenuOpen((isOpen) => !isOpen)}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
            <path fill="#d64b57" d="M1 1h6v6H1z" />
            <path fill="#78b54a" d="M8 1h7v6H8z" />
            <path fill="#4d83d6" d="M1 8h6v7H1z" />
            <path fill="#efc84a" d="M8 8h7v7H8z" />
          </svg>
          시작
        </button>
        <span className="retro-taskbar-divider" aria-hidden="true" />
        <button type="button" className="retro-task-button" aria-current="page">
          <PixelEmotion emotion="calm" className="mr-1 size-5" />
          마음의 기록
        </button>
        <div className="retro-system-tray">
          <span aria-hidden="true">♪</span>
          <time>{taskbarTime}</time>
        </div>
      </footer>

      {showBlueScreen && (
        <div className="retro-blue-screen" role="alertdialog" aria-modal="true" aria-labelledby="blue-screen-title">
          <div className="retro-blue-screen-content">
            <p className="retro-blue-screen-label">Windows</p>
            <h2 id="blue-screen-title">마음에 오류가 발생했습니다</h2>
            <p>너무 힘드셨죠. 당신이 있기에 오늘 하루가 평탄하게 지나갑니다. 힘내세요</p>
            <p className="retro-blue-screen-exit">
              계속하려면 <kbd>ESC</kbd> 키를 눌러 나가세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
