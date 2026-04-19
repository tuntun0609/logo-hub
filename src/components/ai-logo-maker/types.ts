export interface ChatMessage {
  content: string
  id: string
  role: 'user' | 'assistant' | 'system'
  svgCode?: string
  timestamp: number
}

export interface StylePreset {
  description: string
  id: string
  keywords: string[]
  label: string
}

export interface GenerationParams {
  colors?: string[]
  prompt: string
  style?: string
}
