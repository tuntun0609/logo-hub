import type { StylePreset } from './types'

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'minimalist',
    label: '极简',
    description: '简洁几何形状，1-2种颜色',
    keywords: ['simple', 'geometric', 'clean', 'minimal'],
  },
  {
    id: 'modern',
    label: '现代',
    description: '渐变色，圆角，有深度感',
    keywords: ['gradient', 'rounded', 'depth', 'contemporary'],
  },
  {
    id: 'vintage',
    label: '复古',
    description: '徽章风格，装饰性，经典',
    keywords: ['badge', 'ornamental', 'classic', 'retro'],
  },
  {
    id: 'tech',
    label: '科技',
    description: '棱角分明，霓虹色，电路感',
    keywords: ['angular', 'neon', 'circuit', 'futuristic'],
  },
  {
    id: 'organic',
    label: '自然',
    description: '流动曲线，自然元素，柔和',
    keywords: ['flowing', 'nature', 'soft', 'organic'],
  },
]
