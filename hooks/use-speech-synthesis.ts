'use client'

import { useCallback, useEffect, useState } from 'react'

const PREFERRED_VOICES: Record<string, string[]> = {
  en: [
    'Mellow',
    'Daniel',
    'Tom',
    'Alex',
    'Aaron',
    'Arthur',
    'Eddy',
    'Fred',
    'Ralph',
    'Reed',
    'Rocko',
    'Google UK English Male',
  ],
  es: ['Jorge', 'Diego', 'Carlos', 'Enrique', 'Google español de Estados Unidos', 'Google español'],
  fr: ['Thomas', 'Nicolas', 'Antoine', 'Guillaume'],
  de: ['Markus', 'Yannick'],
  it: ['Luca', 'Giorgio'],
  pt: ['Felipe', 'João', 'Ricardo'],
}

const FEMALE_VOICE_NAMES = [
  'Agnes',
  'Allison',
  'Ava',
  'Carmit',
  'Damayanti',
  'Ellen',
  'Fiona',
  'Joana',
  'Kanya',
  'Karen',
  'Kathy',
  'Kyoko',
  'Laura',
  'Lekha',
  'Luciana',
  'Mariska',
  'Mei-Jia',
  'Melina',
  'Milena',
  'Moira',
  'Monica',
  'Nora',
  'Paulina',
  'Samantha',
  'Sara',
  'Satu',
  'Sin-ji',
  'Tessa',
  'Ting-Ting',
  'Veena',
  'Victoria',
  'Yelda',
  'Yuna',
  'Zosia',
]

function isKnownFemaleVoice(voice: SpeechSynthesisVoice) {
  return FEMALE_VOICE_NAMES.some((name) => voice.name.toLowerCase().includes(name.toLowerCase()))
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const prefix = lang.split('-')[0]
  const preferred = PREFERRED_VOICES[prefix] ?? []
  const localeVoices = voices.filter(
    (candidate) => candidate.lang.startsWith(prefix) && !isKnownFemaleVoice(candidate)
  )

  for (const name of preferred) {
    const voice = localeVoices.find((candidate) =>
      candidate.name.toLowerCase().includes(name.toLowerCase())
    )
    if (voice) return voice
  }

  return (
    localeVoices.find((candidate) => candidate.lang === lang) ??
    localeVoices.find((candidate) => candidate.default) ??
    localeVoices[0] ??
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
      utterance.pitch = 0.85

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
