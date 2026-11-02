import { supabase } from '../lib/supabase'

function getClient() {
  if (!supabase) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다. .env.local을 확인해 주세요.',
    )
  }

  return supabase
}

export async function fetchDiaries() {
  const { data, error } = await getClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDiary({ content, emotion }) {
  const { error } = await getClient()
    .from('diaries')
    .insert({ content, emotion })

  if (error) throw error
}

export async function deleteDiary(id) {
  const { error } = await getClient().from('diaries').delete().eq('id', id)

  if (error) throw error
}
