import { createClient } from '@supabase/supabase-js'

let supabase

export function getSupabaseClient() {
  if (supabase) return supabase

  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase 설정이 없습니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 설정해 주세요.',
    )
  }

  supabase = createClient(url, publishableKey)
  return supabase
}
