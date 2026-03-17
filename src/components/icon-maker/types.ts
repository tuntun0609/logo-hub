export type FillType = 'linear' | 'radial' | 'solid'

export interface FillStyles {
  angle: number
  fillType: FillType
  primaryColor: string
  secondaryColor: string
}

export interface BackgroundStyles {
  noiseOpacity: number
  noiseTexture: boolean
  radialGlare: boolean
  radius: number
  strokeColor: string
  strokeOpacity: number
  strokeSize: number
}

export interface IconStyles {
  color: string
  size: number
  xOffset: number
  yOffset: number
}

export type IconSourceType = 'lucide' | 'text' | 'upload'

export interface IconMakerState {
  background: BackgroundStyles
  customText: string
  fillStyles: FillStyles
  iconId: string | null
  iconSourceType: IconSourceType
  iconStyles: IconStyles
  uploadedSvgUrl: string | null
}

export interface GradientPreset {
  id: number
  primaryColor: string
  secondaryColor: string
}
