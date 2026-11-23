import { EMOTION_MAP, formatDate } from '../constants/emotions'

export default function DiaryCard({ diary, onDelete, isDeleting }) {
  const emotionInfo = EMOTION_MAP[diary.emotion] || {
    label: diary.emotion,
    emoji: '📝',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  }

  const handleDelete = () => {
    if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
      onDelete(diary.id)
    }
  }

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* 상단: 감정 뱃지 + 작성일자 + 삭제 버튼 */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${emotionInfo.badge}`}
            >
              <span className="text-sm">{emotionInfo.emoji}</span>
              <span>{emotionInfo.label}</span>
            </span>
            <time className="text-xs text-slate-400 font-medium">
              {formatDate(diary.created_at)}
            </time>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="일기 삭제"
            className="text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors duration-150 flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            {isDeleting ? (
              <span>삭제 중...</span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>삭제</span>
              </>
            )}
          </button>
        </div>

        {/* 본문 내용 */}
        <p className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap break-words leading-relaxed font-normal">
          {diary.content}
        </p>
      </div>
    </article>
  )
}
