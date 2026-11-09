import { useEffect, useState } from 'react'
import './App.css'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries'

const EMOTIONS = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function App() {
  const [selectedEmotion, setSelectedEmotion] = useState('joy')
  const [content, setContent] = useState('')
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const loadDiaries = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchDiaries()
      setDiaries(data)
    } catch (err) {
      setError('일기를 불러오지 못했습니다. Supabase 연결을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiaries()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await createDiary({ content: content.trim(), emotion: selectedEmotion })
      setContent('')
      await loadDiaries()
    } catch (err) {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDiary(id)
      await loadDiaries()
    } catch (err) {
      setError('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const filteredDiaries =
    filter === 'all'
      ? diaries
      : diaries.filter((item) => item.emotion === filter)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">✍️</div>
          <div>
            <p className="eyebrow">Daily Reflection</p>
            <h1>감정 일기</h1>
          </div>
        </div>
      </header>

      <main className="diary-layout">
        <section className="composer card">
          <div className="section-title">오늘의 감정</div>
          <form onSubmit={handleSubmit}>
            <div className="emotion-selector">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  className={selectedEmotion === emotion.value ? 'active' : ''}
                  onClick={() => setSelectedEmotion(emotion.value)}
                >
                  <span>{emotion.emoji}</span>
                  {emotion.label}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 어떤 감정을 느꼈나요? 자유롭게 적어보세요..."
              rows="6"
            />

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </form>
        </section>

        <section className="list-panel card">
          <div className="list-header">
            <div className="section-title">기록 목록</div>
            <div className="filter-bar">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                전체
              </button>
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  className={filter === emotion.value ? 'active' : ''}
                  onClick={() => setFilter(emotion.value)}
                >
                  {emotion.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="status-box error">{error}</div>}

          {loading ? (
            <div className="status-box">불러오는 중...</div>
          ) : filteredDiaries.length === 0 ? (
            <div className="status-box empty">
              아직 작성한 일기가 없어요. 첫 번째 감정을 남겨보세요.
            </div>
          ) : (
            <div className="diary-list">
              {filteredDiaries.map((diary) => (
                <article key={diary.id} className="diary-card">
                  <div className="diary-header">
                    <div className="diary-tag">
                      <span className="emotion-badge">
                        {EMOTIONS.find((item) => item.value === diary.emotion)?.emoji}
                      </span>
                      <span className="emotion-label">
                        {EMOTIONS.find((item) => item.value === diary.emotion)?.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(diary.id)}
                    >
                      삭제
                    </button>
                  </div>

                  <p className="diary-content">{diary.content}</p>

                  <div className="diary-meta">{formatDate(diary.created_at)}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
