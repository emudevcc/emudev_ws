'use client'
import { useCallback, useRef, useState } from 'react'

type UseSpeechSynthesisReturn = {
  supported: boolean
  speaking: boolean
  speak: (text: string, lang?: string) => void
  cancel: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback((text: string, lang = 'en-US') => {
    audioRef.current?.pause()
    audioRef.current = null

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
    })
      .then((res) => res.json())
      .then(({ audioBase64 }: { audioBase64?: string }) => {
        if (!audioBase64) return
        const audio = new Audio('data:audio/mpeg;base64,' + audioBase64)
        audioRef.current = audio
        audio.onended = () => {
          setSpeaking(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          setSpeaking(false)
          audioRef.current = null
        }
        audio
          .play()
          .then(() => setSpeaking(true))
          .catch(() => {
            setSpeaking(false)
            audioRef.current = null
          })
      })
      .catch(() => {
        /* silent fail */
      })
  }, [])

  const cancel = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setSpeaking(false)
  }, [])

  return { supported: true, speaking, speak, cancel }
}
