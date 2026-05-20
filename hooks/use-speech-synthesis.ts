'use client'

import { useCallback, useEffect, useState } from 'react'

const PREFERRED_VOICES: Record<string, string[]> = {
  en: ['Mellow', 'Daniel', 'Tom', 'Alex', 'Google UK English Male', 'Fred'],
  es: ['Jorge', 'Diego', 'Carlos', 'Google español de Estados Unidos'],
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const prefix = lang.split('-')[0]
  const preferred = PREFERRED_VOICES[prefix] ?? []

  for (const name of preferred) {
    const voice = voices.find(
      (candidate) => candidate.name.includes(name) && candidate.lang.startsWith(prefix)
    )
    if (voice) return voice
  }

  return (
    voices.find((candidate) => candidate.lang === lang) ??
    voices.find((candidate) => candidate.lang.startsWith(prefix)) ??
    null
  )
}

type UseSpeechSynthesisReturn = {
  supported: boolean
  speaking: boolean
  speak: (text: string, lang?: string) => void
  cancel: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)

    function onVoicesChanged() {
      window.speechSynthesis.getVoices()
    }

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
  }, [])

  const speak = useCallback(
    (text: string, lang = 'en-US') => {
      if (!supported) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.pitch = 1

      const voice = pickVoice(lang)
      if (voice) utterance.voice = voice

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speak, cancel }
}
