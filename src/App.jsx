import { useCallback, useEffect, useState } from 'react'
import { addDiary, deleteDiary, fetchDiaries } from './api/diaries'
import { EMOTIONS, emotionOf } from './emotions'

const errorText = (e) =>
  `오류가 발생했습니다. 네트워크 연결과 Supabase 키 설정을 확인해 주세요. (${e?.message ?? e})`

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
    `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
    }`

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-center text-3xl font-bold">📔 감정 일기</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6"
      >
        <div className="grid grid-cols-5 gap-2">
          {EMOTIONS.map((em) => (
            <button
              type="button"
              key={em.value}
              onClick={() => setEmotion(em.value)}
              aria-pressed={emotion === em.value}
              className={`flex flex-col items-center rounded-xl py-2 text-xs transition sm:text-sm ${
                emotion === em.value
                  ? 'bg-indigo-50 ring-2 ring-indigo-500'
                  : 'ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl sm:text-3xl">{em.emoji}</span>
              {em.label}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="오늘의 감정과 생각을 적어보세요..."
          className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200"
        >
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button className={tabClass(filter === 'all')} onClick={() => setFilter('all')}>
          전체
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
        <div className="flex justify-center py-12" role="status" aria-label="로딩 중">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-slate-500">
          {diaries.length === 0
            ? '아직 작성된 일기가 없어요. 오늘의 첫 감정을 기록해 보세요 ✍️'
            : '이 감정으로 작성된 일기가 없어요.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((d) => {
            const em = emotionOf(d.emotion)
            return (
              <li
                key={d.id}
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <span className="text-3xl" title={em?.label}>
                  {em?.emoji ?? '❔'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap break-words">{d.content}</p>
                  <time className="mt-2 block text-xs text-slate-400">
                    {new Date(d.created_at).toLocaleString('ko-KR')}
                  </time>
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="self-start rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="일기 삭제"
                >
                  삭제
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

export default App
