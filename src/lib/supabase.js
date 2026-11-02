import { createClient } from '@supabase/supabase-js'

let supabase

export function getSupabaseClient() {
  if (supabase) return supabase

  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase 설정이 없습니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 입력해 주세요.',
    )
  }

  if (/x{4,}|placeholder|your[_ -]?project/i.test(url) || /x{4,}|placeholder|your[_ -]?key/i.test(publishableKey)) {
    throw new Error(
      '.env.local에 예시 값이 남아 있습니다. Supabase 프로젝트의 실제 URL과 publishable key를 입력해 주세요.',
    )
  }

  try {
    new URL(url)
  } catch {
    throw new Error('Supabase URL 형식이 올바르지 않습니다. .env.local 설정을 확인해 주세요.')
  }

  supabase = createClient(url, publishableKey)
  return supabase
}
