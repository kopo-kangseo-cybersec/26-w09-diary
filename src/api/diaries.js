import { supabase, supabaseConfigurationError } from '../lib/supabase.js'

const supportedEmotions = new Set(['joy', 'calm', 'sad', 'angry', 'anxious'])

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigurationError ?? 'Supabase 클라이언트를 사용할 수 없습니다.')
  }
  return supabase
}

export async function fetchDiaries() {
  const { data, error } = await getClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!Array.isArray(data)) {
    throw new Error('일기 목록 응답 형식이 올바르지 않습니다.')
  }
  return data
}

export async function createDiary({ content, emotion }) {
  const trimmedContent = content.trim()
  if (!trimmedContent) throw new Error('일기 내용을 입력해 주세요.')
  if (!supportedEmotions.has(emotion)) throw new Error('지원하지 않는 감정입니다.')

  const { error } = await getClient()
    .from('diaries')
    .insert({ content: trimmedContent, emotion })

  if (error) throw error
}

export async function deleteDiary(id) {
  if (id === null || id === undefined) throw new Error('삭제할 일기 ID가 없습니다.')

  const { error } = await getClient()
    .from('diaries')
    .delete()
    .eq('id', id)

  if (error) throw error
}
