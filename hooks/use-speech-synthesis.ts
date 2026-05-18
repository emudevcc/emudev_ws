'use client'

import { useCallback, useEffect, useState } from 'react'

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
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const speak = useCallback(
    (text: string, lang = 'en-US') => {
      if (!supported) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.pitch = 1

      const languagePrefix = lang.split('-')[0]
      const voice = window.speechSynthesis
        .getVoices()
        .find((candidate) => candidate.lang.startsWith(languagePrefix))
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
