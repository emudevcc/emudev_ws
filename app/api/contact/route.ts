import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'emudev.cc'
  const to = process.env.CONTACT_TO_EMAIL ?? process.env.ADMIN_EMAIL ?? ''

  if (!to) {
    return NextResponse.json({ error: 'Recipient is not configured' }, { status: 503 })
  }

  try {
    await resend.emails.send({
      from: `Portfolio <contact@${domain}>`,
      to,
      replyTo: email,
      subject: `New contact: ${name}`,
      text: [
        `From: ${name} <${email}>`,
        body.company ? `Company: ${body.company}` : '',
        body.oppType ? `Opportunity: ${body.oppType}` : '',
        body.budget ? `Budget: ${body.budget}` : '',
        body.timeline ? `Timeline: ${body.timeline}` : '',
        body.foundVia ? `Found via: ${body.foundVia}` : '',
        '',
        message,
      ]
        .filter(Boolean)
        .join('\n'),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact-api] Resend error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
