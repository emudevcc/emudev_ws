'use server'

import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function submitContact(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const name = ((formData.get('name') as string | null) ?? '').trim()
  const email = ((formData.get('email') as string | null) ?? '').trim()
  const message = ((formData.get('message') as string | null) ?? '').trim()

  if (!name || !email || !message) return { error: 'All fields are required.' }
  if (name.length > 100) return { error: 'Name is too long.' }
  if (message.length > 2000) return { error: 'Message is too long.' }
  if (!EMAIL_RE.test(email)) return { error: 'Invalid email address.' }

  const supabase = await createSupabaseServerClient()
  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({ name, email, message })

  if (dbError) return { error: 'Failed to save your message. Please try again.' }

  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'emudev.cc'
  try {
    await resend.emails.send({
      from: `Portfolio <contact@${domain}>`,
      to: process.env.ADMIN_EMAIL ?? 'esteban.montero@gmail.com',
      replyTo: email,
      subject: `New message from ${escapeHtml(name)}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    })
  } catch (err) {
    console.error('[contact] Resend notification failed:', err)
    // Submission is saved — don't fail the user response
  }

  return { success: true }
}
