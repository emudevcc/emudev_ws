'use server'

import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContact(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim()
  const message = (formData.get('message') as string).trim()

  if (!name || !email || !message) return { error: 'All fields are required.' }
  if (name.length > 100) return { error: 'Name is too long.' }
  if (message.length > 2000) return { error: 'Message is too long.' }

  const supabase = await createSupabaseServerClient()
  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({ name, email, message })

  if (dbError) return { error: 'Failed to save your message. Please try again.' }

  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'emudev.cc'
  await resend.emails.send({
    from: `Portfolio <contact@${domain}>`,
    to: process.env.ADMIN_EMAIL ?? 'esteban.montero@gmail.com',
    replyTo: email,
    subject: `New message from ${name}`,
    html: `<p><strong>${name}</strong> &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`,
  })

  return { success: true }
}
