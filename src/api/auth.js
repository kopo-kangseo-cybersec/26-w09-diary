import { getSupabaseClient } from '../lib/supabase.js'

export async function signIn(email, password) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(email, password) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: email.trim(),
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut()

  if (error) throw error
}
