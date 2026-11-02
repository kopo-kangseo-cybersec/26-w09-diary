import { supabase } from '../lib/supabase.js'

export const EMOTION_OPTIONS = [
  { value: 'joy', label: '기쁨', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '😌' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😠' },
  { value: 'anxious', label: '불안', emoji: '😰' },
]

export async function fetchDiaries(filter = 'all') {
  let query = supabase.from('diaries').select('*')

  if (filter !== 'all') {
    query = query.eq('emotion', filter)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createDiary({ content, emotion }) {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error('일기 내용을 입력해 주세요.')
  }

  const { data, error } = await supabase
    .from('diaries')
    .insert({ content: trimmedContent, emotion })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
