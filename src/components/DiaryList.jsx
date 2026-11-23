import DiaryCard from './DiaryCard'
import { EMOTION_MAP } from '../constants/emotions'

export default function DiaryList({
  diaries,
  isLoading,
  error,
  currentFilter,
  onRetry,
  onDelete,
  deletingId,
}) {
  // 1. 에러 상태
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-6">
        <div className="text-3xl mb-2">⚠️</div>
        <h3 className="text-base font-bold text-rose-800 mb-1">
          일기를 불러오는데 실패했습니다
        </h3>
        <p className="text-xs sm:text-sm text-rose-600 mb-4 max-w-sm mx-auto">
          {error.message || '네트워크 연결 또는 Supabase 환경변수 설정을 확인해주세요.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <span>다시 시도</span>
            <span>🔄</span>
          </button>
        )}
      </div>
    )
  }

  // 2. 로딩 상태
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-100 text-slate-600 mb-3 animate-spin">
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500">
          기록된 일기를 불러오는 중입니다...
        </p>
      </div>
    )
  }

  // 3. 빈 상태
  if (!diaries || diaries.length === 0) {
    const isFiltered = currentFilter !== 'all'
    const emotionLabel = EMOTION_MAP[currentFilter]?.label || ''

    return (
      <div className="bg-white/60 border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center my-4">
        <div className="text-4xl sm:text-5xl mb-3">
          {isFiltered ? EMOTION_MAP[currentFilter]?.emoji || '💭' : '🌱'}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-700 mb-1">
          {isFiltered
            ? `선택한 '${emotionLabel}' 감정의 일기가 없습니다`
            : '아직 작성된 일기가 없습니다'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
          {isFiltered
            ? '다른 감정을 선택하거나 오늘의 감정 일기를 새로 작성해보세요.'
            : '오늘 하루의 감정을 위 입력창에 첫 번째로 기록해보세요!'}
        </p>
      </div>
    )
  }

  // 4. 목록 표시
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
        <span>총 {diaries.length}개의 기록</span>
        <span className="text-slate-400">최신순</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {diaries.map((diary) => (
          <DiaryCard
            key={diary.id}
            diary={diary}
            onDelete={onDelete}
            isDeleting={deletingId === diary.id}
          />
        ))}
      </div>
    </div>
  )
}
