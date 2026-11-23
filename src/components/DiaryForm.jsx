import { useState } from 'react'
import { EMOTIONS } from '../constants/emotions'

export default function DiaryForm({ onSubmit, isSubmitting }) {
  const [selectedEmotion, setSelectedEmotion] = useState('joy')
  const [content, setContent] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedEmotion) {
      setFormError('오늘의 감정을 선택해주세요.')
      return
    }

    if (!content.trim()) {
      setFormError('일기 내용을 입력해주세요.')
      return
    }

    try {
      await onSubmit({
        emotion: selectedEmotion,
        content: content.trim(),
      })
      setContent('')
    } catch (err) {
      setFormError(err.message || '일기 저장에 실패했습니다.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md"
    >
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span>✍️</span> 오늘 어떤 하루를 보내셨나요?
      </h2>

      {/* 감정 선택 영역 */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          오늘의 감정 선택
        </label>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {EMOTIONS.map((emotion) => {
            const isSelected = selectedEmotion === emotion.key
            return (
              <button
                key={emotion.key}
                type="button"
                onClick={() => {
                  setSelectedEmotion(emotion.key)
                  if (formError) setFormError('')
                }}
                disabled={isSubmitting}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? `${emotion.activeBg} font-bold scale-[1.03] shadow-md`
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-2xl sm:text-3xl mb-1 filter drop-shadow-xs">
                  {emotion.emoji}
                </span>
                <span className="text-xs sm:text-sm font-medium tracking-tight">
                  {emotion.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 일기 본문 입력 영역 */}
      <div className="mb-4">
        <label
          htmlFor="diary-content"
          className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
        >
          일기 내용
        </label>
        <textarea
          id="diary-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (formError) setFormError('')
          }}
          placeholder="오늘 마음에 남은 순간, 기분, 생각을 자유롭게 적어보세요..."
          rows={4}
          disabled={isSubmitting}
          className="w-full px-4 py-3 text-sm sm:text-base text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between items-center mt-1 px-1">
          {formError ? (
            <p className="text-xs font-medium text-rose-500">{formError}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-400 ml-auto">
            {content.length} 자
          </span>
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all duration-150 shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
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
            <span>저장 중...</span>
          </>
        ) : (
          <>
            <span>일기 저장하기</span>
            <span>💾</span>
          </>
        )}
      </button>
    </form>
  )
}
