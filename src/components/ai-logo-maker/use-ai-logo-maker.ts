import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useState } from 'react'
import { downloadBlob, svgToPng } from '@/lib/svg-to-png'
import {
  extractSvgFromMarkdown,
  sanitizeSvg,
  validateSvg,
} from '@/lib/svg-validator'
import type { ChatMessage } from './types'

function createUserMessage(prompt: string): ChatMessage {
  return {
    id: Date.now().toString(),
    role: 'user',
    content: prompt,
    timestamp: Date.now(),
  }
}

function createAssistantMessage(): ChatMessage {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? `生成失败：${error.message}`
    : '生成失败，请稍后再试。'
}

async function consumeLogoStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  assistantMessageId: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setCurrentSvg: Dispatch<SetStateAction<string>>
): Promise<string> {
  let accumulatedText = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    const chunk = decoder.decode(value, { stream: true })
    accumulatedText += chunk

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
      )
    )

    const svgCode = extractSvgFromMarkdown(accumulatedText)
    if (svgCode && validateSvg(svgCode)) {
      const sanitized = sanitizeSvg(svgCode)
      setCurrentSvg(sanitized)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, svgCode: sanitized } : m
        )
      )
    }
  }
  return accumulatedText
}

function applyFinalSvgFromText(
  accumulatedText: string,
  assistantMessageId: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setCurrentSvg: Dispatch<SetStateAction<string>>
): void {
  const finalSvgCode = extractSvgFromMarkdown(accumulatedText)
  if (finalSvgCode && validateSvg(finalSvgCode)) {
    const sanitized = sanitizeSvg(finalSvgCode)
    setCurrentSvg(sanitized)
    setMessages((prev) =>
      prev.map((message) =>
        message.id === assistantMessageId
          ? { ...message, svgCode: sanitized }
          : message
      )
    )
  }
}

export function useAiLogoMaker() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentSvg, setCurrentSvg] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string>('minimalist')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [editMode, setEditMode] = useState(false)

  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isGenerating) {
        return
      }

      const userMessage = createUserMessage(prompt)

      setMessages((prev) => [...prev, userMessage])
      setIsGenerating(true)

      try {
        const requestMessages = [...messages, userMessage].map((message) => ({
          role: message.role,
          content: message.content,
        }))

        const response = await fetch('/api/ai/generate-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: requestMessages,
            style: selectedStyle,
            colors: selectedColors,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || 'Failed to generate logo')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedText = ''
        const assistantMessage = createAssistantMessage()

        setMessages((prev) => [...prev, assistantMessage])

        if (reader) {
          accumulatedText = await consumeLogoStream(
            reader,
            decoder,
            assistantMessage.id,
            setMessages,
            setCurrentSvg
          )
        }

        applyFinalSvgFromText(
          accumulatedText,
          assistantMessage.id,
          setMessages,
          setCurrentSvg
        )
      } catch (error) {
        console.error('Generation error:', error)
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getErrorMessage(error),
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsGenerating(false)
      }
    },
    [messages, selectedStyle, selectedColors, isGenerating]
  )

  const handleDownload = useCallback(() => {
    if (!currentSvg) {
      return
    }

    const blob = new Blob([currentSvg], { type: 'image/svg+xml' })
    const filename = `logo-${Date.now()}.svg`
    downloadBlob(blob, filename)
  }, [currentSvg])

  const handleCopy = useCallback(async () => {
    if (!currentSvg) {
      return
    }

    try {
      await navigator.clipboard.writeText(currentSvg)
      return true
    } catch (error) {
      console.error('Copy error:', error)
      return false
    }
  }, [currentSvg])

  const handleExportPng = useCallback(
    async (size = 512) => {
      if (!currentSvg) {
        return
      }

      try {
        const blob = await svgToPng(currentSvg, size)
        const filename = `logo-${Date.now()}.png`
        downloadBlob(blob, filename)
      } catch (error) {
        console.error('PNG export error:', error)
      }
    },
    [currentSvg]
  )

  const updateSvg = useCallback((code: string) => {
    if (validateSvg(code)) {
      const sanitized = sanitizeSvg(code)
      setCurrentSvg(sanitized)
    }
  }, [])

  return {
    messages,
    currentSvg,
    isGenerating,
    selectedStyle,
    selectedColors,
    editMode,
    handleGenerate,
    handleDownload,
    handleCopy,
    handleExportPng,
    setSelectedStyle,
    setSelectedColors,
    setEditMode,
    updateSvg,
  }
}
