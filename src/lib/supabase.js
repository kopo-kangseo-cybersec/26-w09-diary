import { createClient } from '@supabase/supabase-js'

let supabaseClient

export function getSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase 설정을 찾을 수 없습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 .env.local에 설정한 뒤 앱을 다시 실행해 주세요.',
    )
  }

  let parsedUrl
  try {
    parsedUrl = new URL(supabaseUrl)
  } catch {
    throw new Error('VITE_SUPABASE_URL이 올바른 URL 형식인지 확인해 주세요.')
  }

  if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
    throw new Error('VITE_SUPABASE_URL은 http 또는 https 주소여야 합니다.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabasePublishableKey)
  }

  return supabaseClient
}
