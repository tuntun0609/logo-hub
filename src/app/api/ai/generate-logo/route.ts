import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { STYLE_PRESETS } from '@/components/ai-logo-maker/style-presets'

export const maxDuration = 30
const MAX_OUTPUT_TOKENS = 1200
const MAX_HISTORY_MESSAGES = 8
const MAX_MESSAGE_CHARS = 1200

function buildSystemPrompt(style?: string, colors?: string[]): string {
  const stylePreset = STYLE_PRESETS.find((p) => p.id === style)
  const styleKeywords = stylePreset?.keywords.join(', ') || ''

  let prompt = `You are an expert SVG logo designer. Generate clean, professional SVG logos.

CRITICAL RULES:
1. Always return valid SVG code wrapped in markdown: \`\`\`svg\n...\n\`\`\`
2. Use viewBox="0 0 100 100" for perfect scalability
3. Keep paths simple and semantic
4. Use meaningful IDs and classes
5. Optimize for clarity and recognizability
6. Briefly explain your design choices after the SVG code

SVG STRUCTURE:
- Start with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
- Use <g> for grouping related elements
- Prefer <path> over complex shapes when possible
- Keep total elements under 20 for simplicity`

  if (stylePreset) {
    prompt += `\n\nSTYLE: ${stylePreset.label} (${stylePreset.description})
Keywords: ${styleKeywords}`
  }

  if (colors && colors.length > 0) {
    prompt += `\n\nCOLOR PALETTE: Use these colors: ${colors.join(', ')}`
  }

  prompt += '\n\nREMEMBER: Always wrap SVG in ```svg markdown code block!'

  return prompt
}

function trimMessageContent(content: string): string {
  if (content.length <= MAX_MESSAGE_CHARS) {
    return content
  }

  return `${content.slice(0, MAX_MESSAGE_CHARS)}…`
}

function normalizeMessages(
  messages: Array<{ content: string; role: string }>
): Array<{ content: string; role: 'assistant' | 'user' }> {
  return messages
    .filter(
      (message): message is { content: string; role: 'assistant' | 'user' } =>
        (message.role === 'assistant' || message.role === 'user') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      ...message,
      content: trimMessageContent(message.content.trim()),
    }))
}

export async function POST(req: Request) {
  try {
    const { messages, style, colors } = await req.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response('OpenRouter API key not configured', { status: 500 })
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    const systemPrompt = buildSystemPrompt(style, colors)
    const normalizedMessages = normalizeMessages(
      Array.isArray(messages) ? messages : []
    )

    const result = streamText({
      model: openrouter.chat('google/gemini-3.1-flash-lite-preview', {
        maxTokens: MAX_OUTPUT_TOKENS,
      }),
      system: systemPrompt,
      messages: normalizedMessages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions: {
        openrouter: {
          max_tokens: MAX_OUTPUT_TOKENS,
        },
      },
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Generate logo error:', error)
    return new Response(
      error instanceof Error ? error.message : 'Failed to generate logo',
      { status: 500 }
    )
  }
}
