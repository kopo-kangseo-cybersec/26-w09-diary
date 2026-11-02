import { getSupabaseClient } from '../lib/supabase.js'

export async function fetchDiaries() {
  const { data, error } = await getSupabaseClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function createDiary({ content, emotion }) {
  if (!content?.trim()) {
    throw new Error('일기 내용을 입력해 주세요.')
  }

  if (!['joy', 'calm', 'sad', 'angry', 'anxious', 'sleepy'].includes(emotion)) {
    throw new Error('감정을 선택해 주세요.')
  }

  const { error } = await getSupabaseClient()
    .from('diaries')
    .insert({ content: content.trim(), emotion })

  if (error) throw error
}

export async function deleteDiary(id) {
  const { error } = await getSupabaseClient()
    .from('diaries')
    .delete()
    .eq('id', id)

  if (error) throw error
}
