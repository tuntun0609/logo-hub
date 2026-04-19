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
      <div className="shrink-0 border-border/70 border-b bg-muted/15 px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-muted-foreground text-xs">风格</span>
          {STYLE_PRESETS.map((preset) => {
            const active = preset.id === selectedStyle

            return (
              <button
                aria-pressed={active}
                className={cn(
                  'h-8 shrink-0 rounded-full border px-3.5 font-medium text-xs transition',
                  active
                    ? 'border-foreground/15 bg-foreground text-background shadow-sm'
                    : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/45 hover:text-foreground'
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

      <div className="thin-scrollbar min-h-0 overflow-y-auto overscroll-contain px-3.5 py-3.5 sm:px-4">
        {messages.length === 0 ? (
          <div className="grid h-full content-center gap-4 py-2">
            <div className="rounded-[1.4rem] border border-border/70 bg-muted/20 p-4">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/85 text-muted-foreground">
                  <MessageSquare className="size-5" />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className="font-medium text-base tracking-tight">
                    一句需求就能开始出草图
                  </p>
                  <p className="text-muted-foreground text-sm leading-6">
                    输入品牌名、行业、图形元素和颜色方向。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  className="rounded-[1.15rem] border border-border/70 bg-background px-3.5 py-2.5 text-left text-sm leading-6 transition hover:border-foreground/15 hover:text-foreground"
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
        ) : (
          <div className="space-y-4 pr-1 pb-2">
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-border/70 border-t bg-background/90 px-3.5 py-3.5 sm:px-4">
        <ChatInput disabled={isGenerating} onSend={onSend} />
      </div>
    </div>
  )
}
