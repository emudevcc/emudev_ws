'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognitionEventLike = Event & {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type SpeechRecognitionErrorEvent = Event & {
  error: string
}

type SpeechRecognition = EventTarget & {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
}

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

type UseSpeechRecognitionReturn = {
  supported: boolean
  listening: boolean
  transcript: string
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(
  lang = 'en-US',
  onTranscript?: (transcript: string) => void
): UseSpeechRecognitionReturn {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const speechWindow = window as SpeechWindow
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang
    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('')
      setTranscript(nextTranscript)
      onTranscriptRef.current?.(nextTranscript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') setListening(false)
    }

    recognitionRef.current = recognition
    setSupported(true)

    return () => {
      recognition.abort()
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = lang
  }, [lang])

  const start = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    setTranscript('')
    setListening(true)
    try {
      recognition.start()
    } catch {
      setListening(false)
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const reset = useCallback(() => setTranscript(''), [])

  return { supported, listening, transcript, start, stop, reset }
}
