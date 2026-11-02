import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

let isValidUrl = false
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl)
    isValidUrl = url.protocol === 'https:' || url.protocol === 'http:'
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
  }
}

export const supabaseConfigurationError = !supabaseUrl || !publishableKey
  ? 'Supabase 환경변수가 설정되지 않았습니다.'
  : !isValidUrl
    ? 'Supabase URL 형식이 올바르지 않습니다.'
    : null

export const supabase = supabaseConfigurationError
  ? null
  : createClient(supabaseUrl, publishableKey)
