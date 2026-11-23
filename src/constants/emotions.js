export const EMOTIONS = [
  {
    key: 'joy',
    label: '기쁨',
    emoji: '😊',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    activeBg: 'bg-amber-500 text-white border-amber-500 shadow-amber-200',
  },
  {
    key: 'calm',
    label: '평온',
    emoji: '😌',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    activeBg: 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-200',
  },
  {
    key: 'sad',
    label: '슬픔',
    emoji: '😢',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    activeBg: 'bg-sky-500 text-white border-sky-500 shadow-sky-200',
  },
  {
    key: 'angry',
    label: '화남',
    emoji: '😠',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    activeBg: 'bg-rose-500 text-white border-rose-500 shadow-rose-200',
  },
  {
    key: 'anxious',
    label: '불안',
    emoji: '😰',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    activeBg: 'bg-purple-500 text-white border-purple-500 shadow-purple-200',
  },
]

export const EMOTION_MAP = Object.fromEntries(
  EMOTIONS.map((emotion) => [emotion.key, emotion])
)

/**
 * 날짜 문자열을 한국어 친절한 포맷으로 변환합니다.
 * @param {string} dateString ISO 날짜 문자열
 * @returns {string} 포맷팅된 날짜 (예: 2026. 11. 23. 12:30)
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
