import { supabase, supabaseConfigurationError } from '../lib/supabase.js'

const table = 'diaries'
const allowedEmotions = new Set(['joy', 'calm', 'sad', 'angry', 'anxious'])

function getClient() {
  if (supabaseConfigurationError) {
    throw new Error(supabaseConfigurationError)
  }
  if (!supabase) {
    throw new Error('Supabase 클라이언트를 초기화하지 못했어요.')
  }
  return supabase
}

export async function fetchDiaries() {
  const { data, error } = await getClient()
    .from(table)
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDiary({ content, emotion }) {
  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error('일기 내용을 입력해주세요.')
  }
  if (!allowedEmotions.has(emotion)) {
    throw new Error('목록에 있는 감정 중 하나를 선택해주세요.')
  }

  const { error } = await getClient()
    .from(table)
    .insert({ content: content.trim(), emotion })

  if (error) throw error
}

export async function deleteDiary(id) {
  if (id === null || id === undefined || id === '') {
    throw new Error('삭제할 일기를 찾을 수 없어요.')
  }

  const { error } = await getClient().from(table).delete().eq('id', id)

  if (error) throw error
}
