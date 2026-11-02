import { useEffect, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'
import './journal.css'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'joy' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'calm' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'sad' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'angry' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'anxious' },
]

const today = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

function errorMessage(error, action) {
  if (error instanceof Error && error.message.includes('Supabase 설정이 필요합니다')) {
    return error.message
  }

  return `${action}지 못했어요. 네트워크와 Supabase 설정을 확인해 주세요.`
}

function formatDateTime(value) {
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
  const [selectedEmotion, setSelectedEmotion] = useState('calm')
  const [activeFilter, setActiveFilter] = useState('all')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    fetchDiaries()
      .then((entries) => {
        if (isMounted) setDiaries(entries)
      })
      .catch((loadError) => {
        if (isMounted) setError(errorMessage(loadError, '일기를 불러오'))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const visibleDiaries =
    activeFilter === 'all'
      ? diaries
      : diaries.filter((diary) => diary.emotion === activeFilter)

  async function refreshDiaries() {
    setDiaries(await fetchDiaries())
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent || !selectedEmotion || isSaving) return

    setIsSaving(true)
    setError('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      await refreshDiaries()
    } catch (saveError) {
      setError(errorMessage(saveError, '일기를 저장하'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setError('')

    try {
      await deleteDiary(id)
      await refreshDiaries()
    } catch (deleteError) {
      setError(errorMessage(deleteError, '일기를 삭제하'))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleRetry() {
    setIsLoading(true)
    setError('')

    try {
      await refreshDiaries()
    } catch (loadError) {
      setError(errorMessage(loadError, '일기를 불러오'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="마음의 페이지 홈">
          <span className="wordmark-mark" aria-hidden="true">✿</span>
          <span>마음의 페이지</span>
        </a>
        <span className="today-label"><span aria-hidden="true">✦</span> {today}</span>
      </header>

      <main
        id="top"
        className="journal-layout mx-auto grid w-[calc(100%_-_28px)] max-w-[1120px] grid-cols-1 items-start gap-[34px] py-[22px] min-[481px]:w-[calc(100%_-_40px)] min-[481px]:gap-[42px] min-[481px]:py-8 min-[801px]:w-[calc(100%_-_64px)] min-[801px]:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)] min-[801px]:gap-[7vw] min-[801px]:py-[62px]"
      >
        <section className="composer-panel" aria-labelledby="page-title">
          <div className="section-kicker"><span /> 오늘의 한 장</div>
          <h1 id="page-title">오늘의 마음을<br />기록해요.</h1>
          <p className="date-note">{today}</p>

          <form onSubmit={handleSubmit}>
            <fieldset className="emotion-fieldset">
              <legend>오늘 마음에 가까운 표정은?</legend>
              <div className="emotion-options grid grid-cols-5 gap-[7px]">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    className={`emotion-option emotion-${emotion.color}${selectedEmotion === emotion.value ? ' is-selected' : ''}`}
                    aria-pressed={selectedEmotion === emotion.value}
                    onClick={() => setSelectedEmotion(emotion.value)}
                  >
                    <span className="emotion-emoji" aria-hidden="true">{emotion.emoji}</span>
                    <span>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="entry-label" htmlFor="diary-content">오늘의 이야기</label>
            <textarea
              id="diary-content"
              className="entry-input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="마음에 남은 순간을 천천히 적어보세요."
              rows={6}
              maxLength={5000}
              required
            />
            <div className="composer-footer">
              <span className="character-count">{content.length} / 5000</span>
              <button
                className="save-button"
                type="submit"
                disabled={!content.trim() || !selectedEmotion || isSaving}
              >
                {isSaving ? '저장 중...' : '일기장에 저장'}
                <span aria-hidden="true">♡</span>
              </button>
            </div>
          </form>
          <div className="privacy-note"><span aria-hidden="true">♡</span> 이 일기장은 누구나 함께 볼 수 있어요.</div>
        </section>

        <section className="entries-section" aria-labelledby="entries-title">
          <div className="entries-heading">
            <div>
              <div className="section-kicker"><span /> 작은 마음 보관함</div>
              <h2 id="entries-title">차곡차곡 쌓인 마음 <span>{diaries.length}</span></h2>
            </div>
            <span className="latest-label">새로 적은 순</span>
          </div>

          <div className="filter-tabs" role="tablist" aria-label="감정별 일기 필터">
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'all'}
              className={activeFilter === 'all' ? 'is-active' : ''}
              onClick={() => setActiveFilter('all')}
            >
              전체 <span>{diaries.length}</span>
            </button>
            {emotions.map((emotion) => {
              const count = diaries.filter((diary) => diary.emotion === emotion.value).length
              return (
                <button
                  key={emotion.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === emotion.value}
                  className={activeFilter === emotion.value ? 'is-active' : ''}
                  onClick={() => setActiveFilter(emotion.value)}
                >
                  <span aria-hidden="true">{emotion.emoji}</span> {emotion.label}
                  <span>{count}</span>
                </button>
              )
            })}
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span>{error}</span>
              {!isLoading && <button type="button" onClick={handleRetry}>다시 시도</button>}
            </div>
          )}

          {isLoading ? (
            <div className="loading-state" role="status">
              <span className="loading-spinner" />
              <span>기록을 불러오는 중...</span>
            </div>
          ) : error && visibleDiaries.length === 0 ? null : visibleDiaries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">✿</span>
              <h3>{diaries.length === 0 ? '아직 남겨진 기록이 없어요.' : '이 감정의 기록이 아직 없어요.'}</h3>
              <p>{diaries.length === 0 ? '오늘의 마음을 첫 페이지에 적어보세요.' : '다른 감정 탭에서 기록을 살펴보세요.'}</p>
            </div>
          ) : (
            <div className="entries-list">
              {visibleDiaries.map((diary) => {
                const emotion = emotions.find((item) => item.value === diary.emotion)
                return (
                  <article className={`diary-entry note-${emotion?.color ?? 'calm'}`} key={diary.id}>
                    <div className={`entry-emotion emotion-${emotion?.color ?? 'calm'}`} aria-label={emotion?.label ?? '감정'}>
                      {emotion?.emoji ?? '📝'}
                    </div>
                    <div className="entry-body">
                      <div className="entry-meta">
                        <span className={`entry-mood mood-${emotion?.color ?? 'calm'}`}>
                          {emotion?.label ?? '기록'}
                        </span>
                        <time dateTime={diary.created_at}>{formatDateTime(diary.created_at)}</time>
                      </div>
                      <p>{diary.content}</p>
                    </div>
                    <button
                      className="delete-button"
                      type="button"
                      aria-label="일기 삭제"
                      title="일기 삭제"
                      disabled={deletingId !== null}
                      onClick={() => handleDelete(diary.id)}
                    >
                      {deletingId === diary.id ? <span className="loading-spinner" /> : '×'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <footer className="page-footer"><span aria-hidden="true">♡</span> 오늘도 마음을 적어줘서 고마워요 <span aria-hidden="true">♡</span></footer>
    </div>
  )
}

export default App
