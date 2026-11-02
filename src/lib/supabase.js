
import { createClient } from '@supabase/supabase-js'

// 환경변수 불러오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

// 환경변수 누락 확인
const missingVariables = []

if (!supabaseUrl) {
  missingVariables.push('VITE_SUPABASE_URL')
}

if (!supabasePublishableKey) {
  missingVariables.push('VITE_SUPABASE_PUBLISHABLE_KEY')
}

export const supabaseConfigError =
  missingVariables.length > 0
    ? `환경변수가 설정되지 않았습니다: ${missingVariables.join(', ')}`
    : null

// Supabase 클라이언트는 이 파일에서만 생성
export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabasePublishableKey)
