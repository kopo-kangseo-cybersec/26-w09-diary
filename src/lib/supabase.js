import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigError =
  !supabaseUrl || !supabasePublishableKey
    ? 'Supabase URL 또는 publishable key가 설정되지 않았습니다. 환경 변수를 확인해 주세요.'
    : null

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabasePublishableKey)
