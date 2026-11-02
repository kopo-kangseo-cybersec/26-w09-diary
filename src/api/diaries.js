import { supabase } from '../lib/supabase'

export async function fetchDiaries() {
  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addDiary({ content, emotion }) {
  const { error } = await supabase.from('diaries').insert({ content, emotion })
  if (error) throw error
}

export async function deleteDiary(id) {
  const { error } = await supabase.from('diaries').delete().eq('id', id)
  if (error) throw error
}
