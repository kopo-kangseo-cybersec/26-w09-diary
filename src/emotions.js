export const EMOTIONS = [
  { value: 'joy', emoji: '😊', label: '기쁨', card: 'bg-yellow-100', chip: 'bg-yellow-200' },
  { value: 'calm', emoji: '😌', label: '평온', card: 'bg-emerald-100', chip: 'bg-emerald-200' },
  { value: 'sad', emoji: '😢', label: '슬픔', card: 'bg-sky-100', chip: 'bg-sky-200' },
  { value: 'angry', emoji: '😠', label: '화남', card: 'bg-rose-100', chip: 'bg-rose-200' },
  { value: 'anxious', emoji: '😰', label: '불안', card: 'bg-violet-100', chip: 'bg-violet-200' },
]

export const emotionOf = (value) => EMOTIONS.find((e) => e.value === value)
