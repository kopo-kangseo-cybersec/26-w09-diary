
import { supabase, supabaseConfigError } from '../lib/supabase'

// Supabase 연결 확인
function getClient() {
  if (!supabase) {
    throw new Error(
      supabaseConfigError || 'Supabase 연결 설정을 확인해 주세요.'
    )
  }

  return supabase
}

// 1. 일기 목록 조회
// 최신 작성 순으로 정렬
export async function getDiaries() {
  const client = getClient()

  const { data, error } = await client
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

// 2. 일기 추가
export async function addDiary({ content, emotion }) {
  const client = getClient()

  if (!content?.trim()) {
    throw new Error('일기 내용을 입력해 주세요.')
  }

  const { error } = await client
    .from('diaries')
    .insert({
      content: content.trim(),
      emotion,
    })

  if (error) {
    throw error
  }
}

// 3. 일기 삭제
export async function deleteDiary(id) {
  const client = getClient()

  const { error } = await client
    .from('diaries')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
