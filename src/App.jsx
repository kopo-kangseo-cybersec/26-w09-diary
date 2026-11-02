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
        <div>
          <p className="eyebrow">오늘의 마음</p>
          <h1>감정 일기</h1>
        </div>
      </header>

      <main className="diary-layout">
        <section className="card composer-card">
          <form onSubmit={handleSave}>
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

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="오늘 느낀 감정과 순간을 적어보세요..."
              maxLength={300}
              rows={6}
            />

            <div className="composer-actions">
              <span className="char-count">{content.length}/300</span>
              <button type="submit" className="save-button" disabled={isSaving || !content.trim()}>
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </section>

        <section className="card diary-list-card">
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

          {error && <div className="status-banner error">{error}</div>}

          {isLoading ? (
            <div className="status-banner">일기를 불러오는 중입니다...</div>
          ) : visibleEntries.length === 0 ? (
            <div className="empty-state">
              <p>아직 기록이 없어요.</p>
              <span>오늘의 감정을 먼저 남겨보세요.</span>
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
