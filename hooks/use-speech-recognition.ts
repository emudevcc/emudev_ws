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
  requesting: boolean
  transcript: string
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(
  lang = 'en-US',
  onTranscript?: (transcript: string) => void
): UseSpeechRecognitionReturn {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onTranscriptRef = useRef(onTranscript)
  const shouldListenRef = useRef(false)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setListening(false)
        return
      }

      restartTimerRef.current = setTimeout(() => {
        if (!shouldListenRef.current) return
        try {
          recognition.start()
        } catch {
          shouldListenRef.current = false
          setListening(false)
        }
      }, 150)
    }
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return
      shouldListenRef.current = false
      setListening(false)
    }

    recognitionRef.current = recognition
    setSupported(true)

    return () => {
      shouldListenRef.current = false
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      recognition.abort()
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = lang
  }, [lang])

  const start = useCallback(async () => {
    const recognition = recognitionRef.current
    if (!recognition) return

    setRequesting(true)
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      }
    } catch {
      shouldListenRef.current = false
      setListening(false)
      setRequesting(false)
      return
    }

    setTranscript('')
    shouldListenRef.current = true
    setListening(true)
    setRequesting(false)
    try {
      recognition.start()
    } catch {
      shouldListenRef.current = false
      setListening(false)
    }
  }, [])

  const stop = useCallback(() => {
    shouldListenRef.current = false
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    recognitionRef.current?.stop()
    setListening(false)
    setRequesting(false)
  }, [])

  const reset = useCallback(() => setTranscript(''), [])

  return { supported, listening, requesting, transcript, start, stop, reset }
}
