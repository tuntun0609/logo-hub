import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatInput } from './chat-input'
import { ChatMessageComponent } from './chat-message'
import { STYLE_PRESETS } from './style-presets'
import type { ChatMessage } from './types'

interface ChatPanelProps {
  isGenerating: boolean
  messages: ChatMessage[]
  onSend: (message: string) => void
  onStyleChange: (style: string) => void
  selectedStyle: string
}

const QUICK_PROMPTS = [
  '为一家 AI 招聘产品设计一个极简、可信赖的 logo，主色偏深蓝。',
  '做一个适合咖啡品牌的复古徽章 logo，包含字母 C 与咖啡豆元素。',
]

export function ChatPanel({
  messages,
  isGenerating,
  selectedStyle,
  onSend,
  onStyleChange,
}: ChatPanelProps) {
  return (
    <div className="grid h-full max-h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <div className="shrink-0 border-border/70 border-b bg-muted/20 px-3 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="shrink-0 text-muted-foreground text-xs">风格</span>
          {STYLE_PRESETS.map((preset) => {
            const active = preset.id === selectedStyle

            return (
              <button
                aria-pressed={active}
                className={cn(
                  'h-7 shrink-0 rounded-full border px-3 font-medium text-xs transition',
                  active
                    ? 'border-foreground/15 bg-foreground text-background shadow-sm'
                    : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/45 hover:text-foreground'
                )}
                key={preset.id}
                onClick={() => onStyleChange(preset.id)}
                title={preset.description}
                type="button"
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full rounded-[1.25rem] border border-border/70 border-dashed bg-muted/20 px-4 py-5 text-center">
              <div className="space-y-3">
                <MessageSquare className="mx-auto size-9 text-muted-foreground/55" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">一句需求即可开始</p>
                  <p className="mx-auto max-w-sm text-muted-foreground text-xs leading-6">
                    品牌名、行业、图形元素、字母组合或颜色偏好都可以直接说。
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      className="line-clamp-1 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-left text-muted-foreground text-xs transition hover:bg-background hover:text-foreground"
                      disabled={isGenerating}
                      key={prompt}
                      onClick={() => onSend(prompt)}
                      type="button"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-border/70 border-t bg-background/85 px-4 py-3">
        <ChatInput disabled={isGenerating} onSend={onSend} />
      </div>
    </div>
  )
}
