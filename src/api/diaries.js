import { getSupabaseClient } from '../lib/supabase'

const diaryColumns = 'id, content, emotion, created_at'

export async function fetchDiaries() {
  const { data, error } = await getSupabaseClient()
    .from('diaries')
    .select(diaryColumns)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDiary({ content, emotion }) {
  const { error } = await getSupabaseClient()
    .from('diaries')
    .insert({ content, emotion })

  if (error) throw error
}

export async function deleteDiary(id) {
  const { error } = await getSupabaseClient().from('diaries').delete().eq('id', id)

  if (error) throw error
}