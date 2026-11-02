import { useCallback, useEffect, useState } from 'react'
import { addDiary, deleteDiary, fetchDiaries } from './api/diaries'
import { EMOTIONS, emotionOf } from './emotions'

const errorText = (e) =>
  `앗, 문제가 생겼어요. 네트워크 연결과 Supabase 키 설정을 확인해 주세요. (${e?.message ?? e})`

const formatDate = (iso) => {
  const d = new Date(iso)
  const date = d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

// 카드마다 살짝 다른 기울기를 줘서 붙여 놓은 느낌을 낸다
const TILTS = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-[0.5deg]', 'rotate-[0.5deg]']

function App() {
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [emotion, setEmotion] = useState('joy')
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    try {
      setDiaries(await fetchDiaries())
      setError('')
    } catch (e) {
      setError(errorText(e))
    }
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || saving) return
    setSaving(true)
    try {
      await addDiary({ content: text, emotion })
      setContent('')
      await load()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDiary(id)
      await load()
    } catch (err) {
      setError(errorText(err))
    }
  }

  const visible =
    filter === 'all' ? diaries : diaries.filter((d) => d.emotion === filter)

  const tabClass = (active) =>
    `shrink-0 rounded-full border-2 px-3 py-1 transition ${
      active
        ? 'border-pink-400 bg-pink-400 text-white shadow-md'
        : 'border-pink-200 bg-white/80 text-stone-600 hover:bg-pink-50'
    }`

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <h1 className="font-title text-4xl text-pink-500 drop-shadow-sm sm:text-5xl">
          ✨ 나의 감정 일기 ✨
        </h1>
        <p className="mt-2 text-stone-500">오늘 하루, 마음은 어땠나요? 🌷</p>
      </header>

      {/* 새 일기 쓰기: 줄 노트 한 장 */}
      <form
        onSubmit={handleSubmit}
        className="relative mb-10 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 pt-8 shadow-lg sm:p-7 sm:pt-9"
      >
        <span className="tape absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 -rotate-2 rounded-sm shadow-sm" />
        <p className="mb-2 text-stone-500">오늘의 기분은?</p>
        <div className="mb-4 grid grid-cols-5 gap-2">
          {EMOTIONS.map((em) => (
            <button
              type="button"
              key={em.value}
              onClick={() => setEmotion(em.value)}
              aria-pressed={emotion === em.value}
              className={`flex flex-col items-center rounded-2xl py-2 text-base transition sm:text-lg ${
                emotion === em.value
                  ? `${em.chip} -translate-y-1 scale-105 shadow-md ring-2 ring-pink-400`
                  : 'bg-white/70 ring-1 ring-amber-200 hover:-translate-y-0.5 hover:bg-white'
              }`}
            >
              <span className="text-3xl sm:text-4xl">{em.emoji}</span>
              {em.label}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="오늘 있었던 일, 느낀 마음을 살며시 적어보세요..."
          className="lined w-full resize-none rounded-lg bg-white/60 px-3 py-0 text-2xl outline-none placeholder:text-stone-400 focus:bg-white"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="mt-4 w-full rounded-full bg-pink-400 py-2 font-title text-xl text-white shadow-md transition hover:bg-pink-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '저장 중...' : '💌 일기 저장하기'}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border-2 border-dashed border-red-300 bg-red-50 p-3 text-base text-red-600"
        >
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto px-1 pb-2">
        <button className={tabClass(filter === 'all')} onClick={() => setFilter('all')}>
          📖 전체
        </button>
        {EMOTIONS.map((em) => (
          <button
            key={em.value}
            className={tabClass(filter === em.value)}
            onClick={() => setFilter(em.value)}
          >
            {em.emoji} {em.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-2 py-12" role="status" aria-label="로딩 중">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-400" />
          <span className="text-stone-500">일기장을 펼치는 중...</span>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-pink-200 bg-white/60 py-12 text-center text-stone-500">
          {diaries.length === 0
            ? '아직 비어 있는 일기장이에요 📒 오늘의 첫 이야기를 남겨 보세요 ✍️'
            : '이 감정으로 쓴 일기는 아직 없어요 🍃'}
        </p>
      ) : (
        <ul className="space-y-6">
          {visible.map((d, i) => {
            const em = emotionOf(d.emotion)
            return (
              <li
                key={d.id}
                className={`relative rounded-xl p-5 pt-7 shadow-md transition hover:rotate-0 hover:shadow-xl ${
                  em?.card ?? 'bg-stone-100'
                } ${TILTS[i % TILTS.length]}`}
              >
                <span className="tape absolute -top-3 left-6 h-5 w-20 -rotate-3 rounded-sm" />
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-4xl" title={em?.label}>
                    {em?.emoji ?? '❔'}
                  </span>
                  <time className="flex-1 text-base text-stone-500">
                    {formatDate(d.created_at)}
                  </time>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="rounded-full bg-white/70 px-3 py-0.5 text-base text-stone-500 transition hover:bg-red-100 hover:text-red-600"
                    aria-label="일기 삭제"
                  >
                    🗑️ 삭제
                  </button>
                </div>
                <p className="lined whitespace-pre-wrap break-words text-2xl">{d.content}</p>
              </li>
            )
          })}
        </ul>
      )}

      <footer className="mt-12 text-center text-stone-400">- 오늘도 수고했어요 🌙 -</footer>
    </main>
  )
}

export default App
