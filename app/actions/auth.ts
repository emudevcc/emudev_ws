'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function sendMagicLink(formData: FormData) {
  const email = (formData.get('email') as string).trim()
  if (!email) return { error: 'Email is required.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) return { error: error.message }

  return { success: true }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}
