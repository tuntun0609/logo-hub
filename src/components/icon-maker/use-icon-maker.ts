'use client'

import { useCallback, useState } from 'react'
import { GRADIENT_PRESETS } from './presets'
import type {
  BackgroundStyles,
  FillStyles,
  IconMakerState,
  IconStyles,
} from './types'

const HISTORY_MAX = 50

const defaultFillStyles: FillStyles = {
  fillType: 'linear',
  primaryColor: GRADIENT_PRESETS[0].primaryColor,
  secondaryColor: GRADIENT_PRESETS[0].secondaryColor,
  angle: 45,
}

const defaultBackground: BackgroundStyles = {
  radialGlare: false,
  noiseTexture: false,
  noiseOpacity: 0,
  radius: 24,
  strokeSize: 0,
  strokeColor: '#000000',
  strokeOpacity: 100,
}

const defaultIconStyles: IconStyles = {
  color: '#ffffff',
  size: 384,
  xOffset: 0,
  yOffset: 0,
}

export const defaultIconMakerState: IconMakerState = {
  iconId: 'user-plus',
  iconSourceType: 'lucide',
  customText: '',
  uploadedSvgUrl: null,
  fillStyles: defaultFillStyles,
  background: defaultBackground,
  iconStyles: defaultIconStyles,
}

function cloneState(s: IconMakerState): IconMakerState {
  return JSON.parse(JSON.stringify(s))
}

export function useIconMaker(initialState?: Partial<IconMakerState>) {
  const initial = {
    ...defaultIconMakerState,
    ...initialState,
  }
  const [state, setStateInternal] = useState<IconMakerState>(() => initial)
  const [history, setHistory] = useState<IconMakerState[]>(() => [
    cloneState(initial),
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  const setState = useCallback(
    (
      update:
        | Partial<IconMakerState>
        | ((prev: IconMakerState) => IconMakerState)
    ) => {
      setStateInternal((prev) => {
        const next =
          typeof update === 'function' ? update(prev) : { ...prev, ...update }
        setHistory((h) => {
          const truncated = h.slice(0, historyIndex + 1)
          const newHistory = [...truncated, cloneState(next)]
          return newHistory.length > HISTORY_MAX
            ? newHistory.slice(-HISTORY_MAX)
            : newHistory
        })
        setHistoryIndex((i) => i + 1)
        return next
      })
    },
    [historyIndex]
  )

  const undo = useCallback(() => {
    if (historyIndex <= 0) {
      return
    }
    const prevIndex = historyIndex - 1
    setStateInternal(cloneState(history[prevIndex]))
    setHistoryIndex(prevIndex)
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) {
      return
    }
    const nextIndex = historyIndex + 1
    setStateInternal(cloneState(history[nextIndex]))
    setHistoryIndex(nextIndex)
  }, [history, historyIndex])

  const setFillStyles = useCallback(
    (update: Partial<FillStyles>) => {
      setState((prev) => ({
        ...prev,
        fillStyles: { ...prev.fillStyles, ...update },
      }))
    },
    [setState]
  )

  const setBackground = useCallback(
    (update: Partial<BackgroundStyles>) => {
      setState((prev) => ({
        ...prev,
        background: { ...prev.background, ...update },
      }))
    },
    [setState]
  )

  const setIconStyles = useCallback(
    (update: Partial<IconStyles>) => {
      setState((prev) => ({
        ...prev,
        iconStyles: { ...prev.iconStyles, ...update },
      }))
    },
    [setState]
  )

  const applyPreset = useCallback(
    (presetId: number) => {
      const preset = GRADIENT_PRESETS.find((p) => p.id === presetId)
      if (preset) {
        setFillStyles({
          primaryColor: preset.primaryColor,
          secondaryColor: preset.secondaryColor,
        })
      }
    },
    [setFillStyles]
  )

  return {
    state,
    setState,
    setFillStyles,
    setBackground,
    setIconStyles,
    applyPreset,
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
  }
}
