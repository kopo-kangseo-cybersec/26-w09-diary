import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

function isValidSupabaseUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const supabaseConfigurationError =
  !supabaseUrl || !supabasePublishableKey
    ? 'Supabase 설정을 찾을 수 없어요. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 입력하고 개발 서버를 다시 시작해주세요.'
    : !isValidSupabaseUrl(supabaseUrl)
      ? 'VITE_SUPABASE_URL이 올바른 주소가 아니에요. .env.local의 URL을 확인해주세요.'
    : ''

export const supabase =
  supabaseConfigurationError === ''
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null
