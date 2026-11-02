import { supabase, supabaseConfigError } from '../lib/supabase.js'

function getClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError)
  }
  return supabase
}

export async function getDiaries() {
  const { data, error } = await getClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`일기를 불러오지 못했어요: ${error.message}`)
  }
  return data
}

export async function createDiary({ content, emotion }) {
  const { error } = await getClient()
    .from('diaries')
    .insert({ content, emotion })

  if (error) {
    throw new Error(`일기를 저장하지 못했어요: ${error.message}`)
  }
}

export async function deleteDiary(id) {
  const { error } = await getClient()
    .from('diaries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`일기를 삭제하지 못했어요: ${error.message}`)
  }
}
