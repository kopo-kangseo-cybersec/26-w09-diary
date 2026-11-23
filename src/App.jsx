import { useEffect, useState } from 'react'
import Header from './components/Header'
import DiaryForm from './components/DiaryForm'
import EmotionFilter from './components/EmotionFilter'
import DiaryList from './components/DiaryList'
import { getDiaries, createDiary, deleteDiary } from './api/diaries'

export default function App() {
  const [diaries, setDiaries] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 컴포넌트 마운트, 필터 변경, 수동 갱신 트리거 시 목록 조회
  useEffect(() => {
    let isCancelled = false

    const fetchDiaries = async () => {
      try {
        const data = await getDiaries(currentFilter)
        if (!isCancelled) {
          setDiaries(data)
          setError(null)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('일기 목록 로드 실패:', err)
          setError(err)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchDiaries()

    return () => {
      isCancelled = true
    }
  }, [currentFilter, refreshTrigger])

  const handleFilterChange = (filter) => {
    setIsLoading(true)
    setCurrentFilter(filter)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setRefreshTrigger((prev) => prev + 1)
  }

  // 일기 작성 처리
  const handleCreateDiary = async ({ content, emotion }) => {
    setIsSubmitting(true)
    try {
      await createDiary({ content, emotion })
      // 작성 성공 시 목록 다시 조회
      setIsLoading(true)
      setRefreshTrigger((prev) => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 일기 삭제 처리
  const handleDeleteDiary = async (id) => {
    setDeletingId(id)
    try {
      await deleteDiary(id)
      // 삭제 성공 시 목록 다시 조회
      setIsLoading(true)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      alert(err.message || '삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* 앱 상단 헤더 */}
        <Header />

        {/* 일기 작성 폼 */}
        <section className="mb-6">
          <DiaryForm
            onSubmit={handleCreateDiary}
            isSubmitting={isSubmitting}
          />
        </section>

        {/* 감정 필터 바 */}
        <section>
          <EmotionFilter
            currentFilter={currentFilter}
            onSelectFilter={handleFilterChange}
          />
        </section>

        {/* 일기 목록 영역 */}
        <main>
          <DiaryList
            diaries={diaries}
            isLoading={isLoading}
            error={error}
            currentFilter={currentFilter}
            onRetry={handleRefresh}
            onDelete={handleDeleteDiary}
            deletingId={deletingId}
          />
        </main>
      </div>
    </div>
  )
}
