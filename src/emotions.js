export const EMOTIONS = [
  { value: 'joy', emoji: '😊', label: '기쁨' },
  { value: 'calm', emoji: '😌', label: '평온' },
  { value: 'sad', emoji: '😢', label: '슬픔' },
  { value: 'angry', emoji: '😠', label: '화남' },
  { value: 'anxious', emoji: '😰', label: '불안' },
]

export const emotionOf = (value) => EMOTIONS.find((e) => e.value === value)
