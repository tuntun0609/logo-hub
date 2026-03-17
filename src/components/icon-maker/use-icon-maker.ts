'use client'

import { useCallback, useReducer } from 'react'
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
  strokeColor: '#ffffff',
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

interface HistoryState {
  current: IconMakerState
  history: IconMakerState[]
  historyIndex: number
}

type HistoryAction =
  | {
      type: 'set'
      update:
        | Partial<IconMakerState>
        | ((prev: IconMakerState) => IconMakerState)
    }
  | { type: 'undo' }
  | { type: 'redo' }

function historyReducer(
  state: HistoryState,
  action: HistoryAction
): HistoryState {
  switch (action.type) {
    case 'set': {
      const next =
        typeof action.update === 'function'
          ? action.update(state.current)
          : { ...state.current, ...action.update }
      const truncated = state.history.slice(0, state.historyIndex + 1)
      const newHistory = [...truncated, cloneState(next)]
      return {
        current: next,
        history:
          newHistory.length > HISTORY_MAX
            ? newHistory.slice(-HISTORY_MAX)
            : newHistory,
        historyIndex: state.historyIndex + 1,
      }
    }
    case 'undo': {
      if (state.historyIndex <= 0) {
        return state
      }
      const prevIndex = state.historyIndex - 1
      return {
        ...state,
        current: cloneState(state.history[prevIndex]),
        historyIndex: prevIndex,
      }
    }
    case 'redo': {
      if (state.historyIndex >= state.history.length - 1) {
        return state
      }
      const nextIndex = state.historyIndex + 1
      return {
        ...state,
        current: cloneState(state.history[nextIndex]),
        historyIndex: nextIndex,
      }
    }
    default:
      return state
  }
}

export function useIconMaker(initialState?: Partial<IconMakerState>) {
  const initial = {
    ...defaultIconMakerState,
    ...initialState,
  }

  const [historyState, dispatch] = useReducer(historyReducer, {
    current: initial,
    history: [cloneState(initial)],
    historyIndex: 0,
  })

  const setState = useCallback(
    (
      update:
        | Partial<IconMakerState>
        | ((prev: IconMakerState) => IconMakerState)
    ) => {
      dispatch({ type: 'set', update })
    },
    []
  )

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'redo' })
  }, [])

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
    state: historyState.current,
    setState,
    setFillStyles,
    setBackground,
    setIconStyles,
    applyPreset,
    history: historyState.history,
    historyIndex: historyState.historyIndex,
    canUndo: historyState.historyIndex > 0,
    canRedo: historyState.historyIndex < historyState.history.length - 1,
    undo,
    redo,
  }
}
