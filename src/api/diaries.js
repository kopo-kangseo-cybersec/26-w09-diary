import { supabase } from '../lib/supabase'

/**
 * 일기 목록을 조회합니다.
 * @param {string} [emotionFilter='all'] - 조회할 감정 필터 ('all' 또는 'joy' | 'calm' | 'sad' | 'angry' | 'anxious')
 * @returns {Promise<Array>} 일기 목록 (최신순 정렬)
 */
export async function getDiaries(emotionFilter = 'all') {
  let query = supabase
    .from('diaries')
    .select('*')
    .order('created_at', { ascending: false })

  if (emotionFilter && emotionFilter !== 'all') {
    query = query.eq('emotion', emotionFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('일기 목록 조회 실패:', error)
    throw error
  }

  return data ?? []
}

/**
 * 새로운 일기를 추가합니다.
 * @param {Object} diaryData
 * @param {string} diaryData.content - 일기 내용
 * @param {string} diaryData.emotion - 감정 ('joy' | 'calm' | 'sad' | 'angry' | 'anxious')
 * @returns {Promise<Object>} 생성된 일기 데이터
 */
export async function createDiary({ content, emotion }) {
  if (!content || !content.trim()) {
    throw new Error('일기 내용을 입력해주세요.')
  }

  if (!emotion) {
    throw new Error('오늘의 감정을 선택해주세요.')
  }

  const { data, error } = await supabase
    .from('diaries')
    .insert([
      {
        content: content.trim(),
        emotion,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('일기 저장 실패:', error)
    throw error
  }

  return data
}

/**
 * 일기를 삭제합니다.
 * @param {number|string} id - 삭제할 일기 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export async function deleteDiary(id) {
  if (!id) {
    throw new Error('삭제할 일기 ID가 올바르지 않습니다.')
  }

  const { error } = await supabase.from('diaries').delete().eq('id', id)

  if (error) {
    console.error('일기 삭제 실패:', error)
    throw error
  }

  return true
}
