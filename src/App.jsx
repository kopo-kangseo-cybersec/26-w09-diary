import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { createDiary, deleteDiary, fetchDiaries, EMOTION_OPTIONS } from './api/diaries.js'

const FILTERS = [
  { value: 'all', label: '전체' },
  ...EMOTION_OPTIONS.map((emotion) => ({
    value: emotion.value,
    label: `${emotion.emoji} ${emotion.label}`,
  })),
]

const TODAY_LABEL = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

function formatDate(dateString) {
  if (!dateString) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function getEmotionMeta(emotion) {
  return (
    EMOTION_OPTIONS.find((option) => option.value === emotion) ?? EMOTION_OPTIONS[0]
  )
}

function App() {
  const [entries, setEntries] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedEmotion, setSelectedEmotion] = useState('joy')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const visibleEntries = useMemo(
    () =>
      entries.filter(
        (entry) => activeFilter === 'all' || entry.emotion === activeFilter,
      ),
    [entries, activeFilter],
  )

  const loadEntries = async (filter = activeFilter) => {
    setIsLoading(true)
    setError('')

    try {
      const nextEntries = await fetchDiaries(filter)
      setEntries(nextEntries)
    } catch (err) {
      setError(err.message || '일기를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    void loadEntries(activeFilter)
  }, [activeFilter])

  const handleSave = async (event) => {
    event.preventDefault()

    if (!content.trim()) {
      setError('일기 내용을 입력해 주세요.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await createDiary({ content, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion('joy')
      await loadEntries(activeFilter)
    } catch (err) {
      setError(err.message || '일기 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    setError('')

    try {
      await deleteDiary(id)
      await loadEntries(activeFilter)
    } catch (err) {
      setError(err.message || '일기 삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            📖
          </div>
          <div>
            <p className="eyebrow">작은 순간을 모으는 곳</p>
            <h1>오늘의 일기장</h1>
          </div>
        </div>
        <div className="header-note">
          <span aria-hidden="true">✦</span>
          <p>오늘의 마음도 소중한 한 페이지</p>
        </div>
      </header>

      <main className="diary-layout">
        <section className="card composer-card">
          <div className="section-heading">
            <div>
              <p className="section-kicker">TODAY, IN MY WORDS</p>
              <h2>오늘은 어떤 하루였나요?</h2>
            </div>
            <span className="heading-doodle" aria-hidden="true">✎</span>
          </div>

          <form onSubmit={handleSave}>
            <p className="field-label">오늘의 기분을 골라 주세요</p>
            <div className="emotion-picker">
              {EMOTION_OPTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  className={`emotion-button ${selectedEmotion === emotion.value ? 'selected' : ''}`}
                  onClick={() => setSelectedEmotion(emotion.value)}
                  aria-pressed={selectedEmotion === emotion.value}
                >
                  <span className="emotion-emoji">{emotion.emoji}</span>
                  <span>{emotion.label}</span>
                </button>
              ))}
            </div>

            <label className="diary-paper">
              <span className="paper-date">{TODAY_LABEL}</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="마음에 남은 순간을 천천히 적어보세요..."
                maxLength={300}
                rows={6}
                aria-label="오늘의 일기"
              />
            </label>

            <div className="composer-actions">
              <span className="char-count">한 페이지에 {content.length}/300자</span>
              <button type="submit" className="save-button" disabled={isSaving || !content.trim()}>
                <span aria-hidden="true">♡</span>
                {isSaving ? '간직하는 중...' : '일기장에 간직하기'}
              </button>
            </div>
          </form>
        </section>

        <section className="card diary-list-card">
          <div className="section-heading list-heading">
            <div>
              <p className="section-kicker">LITTLE MOMENTS</p>
              <h2>차곡차곡 쌓인 이야기</h2>
            </div>
            <span className="heading-doodle flower-doodle" aria-hidden="true">✿</span>
          </div>

          <div className="filter-wrap">
            <span className="field-label">기분별로 모아보기</span>
            <div className="filter-row">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={activeFilter === filter.value ? 'filter-button active' : 'filter-button'}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="status-banner error">{error}</div>}

          {isLoading ? (
            <div className="status-banner">일기를 불러오는 중입니다...</div>
          ) : visibleEntries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-illustration" aria-hidden="true">🌷</span>
              <p>아직 비어 있는 페이지예요</p>
              <span>오늘의 작은 순간부터 채워 볼까요?</span>
            </div>
          ) : (
            <ul className="diary-list">
              {visibleEntries.map((entry) => {
                const emotionMeta = getEmotionMeta(entry.emotion)

                return (
                  <li key={entry.id} className="diary-item">
                    <div className="entry-header">
                      <span className="entry-emotion">
                        <span className="emotion-emoji">{emotionMeta.emoji}</span>
                        {emotionMeta.label}
                      </span>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        aria-label={`${formatDate(entry.created_at)} 일기 삭제`}
                      >
                        {deletingId === entry.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>

                    <p className="entry-content">{entry.content}</p>
                    <time className="entry-time">{formatDate(entry.created_at)}</time>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
