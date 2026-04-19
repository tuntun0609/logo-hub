import { useState } from 'react'
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'

interface ChatInputProps {
  disabled?: boolean
  onSend: (message: string) => void
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim()
    if (text && !disabled) {
      onSend(text)
      setInput('')
    }
  }

  return (
    <PromptInput className="relative" onSubmit={handleSubmit}>
      <PromptInputTextarea
        className="min-h-24 resize-none pr-12"
        disabled={disabled}
        name="message"
        onChange={(event) => setInput(event.currentTarget.value)}
        placeholder="描述你想要的 logo，例如：品牌名、行业、图形元素、色彩、是否需要字母组合…"
        value={input}
      />
      <PromptInputSubmit
        className="absolute right-2 bottom-2"
        disabled={disabled || !input.trim()}
        status={disabled ? 'streaming' : 'ready'}
      />
    </PromptInput>
  )
}
