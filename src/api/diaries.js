import { getSupabaseClient } from '../lib/supabase.js'

const diaryColumns = 'id, content, emotion, created_at'
const allowedEmotions = new Set(['joy', 'calm', 'sad', 'angry', 'anxious'])

function throwDiaryReadError(step, error) {
  const errorInfo =
    error && typeof error === 'object'
      ? error
      : { message: String(error) }
  const code =
    'code' in errorInfo && typeof errorInfo.code === 'string'
      ? ` [${errorInfo.code}]`
      : ''
  const message =
    'message' in errorInfo && typeof errorInfo.message === 'string'
      ? errorInfo.message
      : '알 수 없는 오류'
  const details =
    'details' in errorInfo && typeof errorInfo.details === 'string'
      ? ` (${errorInfo.details})`
      : ''
  const hint =
    'hint' in errorInfo && typeof errorInfo.hint === 'string'
      ? ` 안내: ${errorInfo.hint}`
      : ''

  throw new Error(`${step}${code}: ${message}${details}${hint}`)
}

export async function getDiaries() {
  const supabase = getSupabaseClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throwDiaryReadError('로그인 확인 실패', userError)
  if (!userData.user) throw new Error('일기를 보려면 먼저 로그인해 주세요.')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profileError) throwDiaryReadError('계정 권한 확인 실패', profileError)

  const isAdmin = profile.role === 'admin'
  const { data, error } = isAdmin
    ? await supabase.rpc('get_admin_diaries')
    : await supabase
        .from('diaries')
        .select(diaryColumns)
        .order('created_at', { ascending: false })

  if (error) {
    throwDiaryReadError(
      isAdmin ? '관리자 일기/작성자 이메일 조회 실패' : '내 일기 조회 실패',
      error,
    )
  }
  return { diaries: data, isAdmin }
}

export async function createDiary({ content, emotion }) {
  const trimmedContent = content.trim()
  if (!trimmedContent) {
    throw new Error('일기 내용을 입력해 주세요.')
  }
  if (!allowedEmotions.has(emotion)) {
    throw new Error('목록에 있는 감정 중 하나를 선택해 주세요.')
  }

  const { data, error } = await getSupabaseClient()
    .from('diaries')
    .insert({ content: trimmedContent, emotion })
    .select(diaryColumns)
    .single()

  if (error) throw error
  return data
}

export async function deleteDiary(id) {
  const { error } = await getSupabaseClient().from('diaries').delete().eq('id', id)

  if (error) throw error
}
