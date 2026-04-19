import { Sparkles, UserRound } from 'lucide-react'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { cn } from '@/lib/utils'
import { SvgMarkup } from './svg-markup'
import type { ChatMessage } from './types'

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const from = isUser ? 'user' : 'assistant'

  return (
    <Message className="max-w-full" from={from}>
      <MessageContent
        className={cn(
          'rounded-[1.15rem] border px-4 py-3 shadow-sm',
          isUser
            ? 'border-primary/15 bg-primary text-primary-foreground group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground'
            : 'w-full border-border/70 bg-muted/30'
        )}
      >
        <div
          className={cn(
            'mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]',
            isUser ? 'text-primary-foreground/75' : 'text-muted-foreground'
          )}
        >
          {isUser ? (
            <UserRound className="size-3" />
          ) : (
            <Sparkles className="size-3" />
          )}
          <span>{isUser ? '你' : 'AI 设计助手'}</span>
        </div>

        {message.content ? (
          <MessageResponse className="text-sm leading-6">
            {message.content}
          </MessageResponse>
        ) : (
          <div className="text-sm leading-6">
            <span className="italic opacity-70">正在生成方案与 SVG…</span>
          </div>
        )}

        {message.svgCode && (
          <div className="mt-3 rounded-[1rem] border border-border/70 bg-background/90 p-3 text-foreground">
            <p className="mb-3 text-muted-foreground text-xs">最新 SVG 预览</p>
            <div className="flex items-center justify-center rounded-[0.9rem] border border-border/60 bg-checkerboard p-4">
              <SvgMarkup
                className="h-20 w-20 [&_svg]:h-full [&_svg]:w-full"
                svgCode={message.svgCode}
              />
            </div>
          </div>
        )}
      </MessageContent>
    </Message>
  )
}
