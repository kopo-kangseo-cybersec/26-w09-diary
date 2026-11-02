import { createClient } from '@supabase/supabase-js'

let supabaseClient

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = import.meta.env

  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'Supabase 설정이 필요합니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 입력해 주세요.',
    )
  }

  supabaseClient = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
  return supabaseClient
}