import { createClient } from '@supabase/supabase-js'

let supabase

export function getSupabaseClient() {
  if (supabase) {
    return supabase
  }

  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase 설정이 없어요. 프로젝트 루트의 .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 입력해 주세요.',
    )
  }

  supabase = createClient(url, publishableKey)
  return supabase
}
