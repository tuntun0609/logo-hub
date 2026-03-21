'use client'

import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import { optimize } from 'svgo/browser'
import type { SvgEditorHandle } from '@/components/svg-viewer/svg-editor'
import { getByteSize, prettifySvg } from '@/lib/svg-utils'
import {
  ALL_CLEAN_KEYS,
  buildCleanOptions,
  CLEAN_PRESETS,
  type CleanOptions,
  type CleanPluginKey,
  type CleanPresetKey,
  getActiveCleanPresetKey,
  getCleanResultMeta,
  getEnabledCleanPlugins,
  makeDefaultCleanOptions,
} from './cleaning'
import type { BgMode, CleanResult } from './types'

const SVG_FILE_NAME_RE = /\.svg$/i
const INVALID_FILE_MESSAGE = '仅支持 SVG 文件，请重新选择或拖入 .svg 文件。'

export function useSvgViewer() {
  const [svgCode, setSvgCode] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number | null>(null)
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null)
  const [cleanResult, setCleanResult] = useState<CleanResult | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard')
  const [isDragging, setIsDragging] = useState(false)
  const [cleanOptions, setCleanOptions] = useState(makeDefaultCleanOptions)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<SvgEditorHandle>(null)

  const hasSvg = svgCode.trim().length > 0
  const showEditor = editorOpen || hasSvg
  const allCleanEnabled = ALL_CLEAN_KEYS.every((key) => cleanOptions[key])
  const noneCleanEnabled = ALL_CLEAN_KEYS.every((key) => !cleanOptions[key])
  const activeCleanPreset = getActiveCleanPresetKey(cleanOptions)
  const cleanResultMeta = cleanResult ? getCleanResultMeta(cleanResult) : null

  const resetResults = useCallback(() => {
    setOptimizedSize(null)
    setCleanResult(null)
  }, [])

  const loadSvgFile = useCallback(
    (file: File) => {
      if (file.type !== 'image/svg+xml' && !SVG_FILE_NAME_RE.test(file.name)) {
        toast.error(INVALID_FILE_MESSAGE, {
          id: 'svg-viewer-invalid-file',
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setSvgCode(text)
        setFileName(file.name)
        setOriginalSize(getByteSize(text))
        resetResults()
        setEditorOpen(true)
      }
      reader.readAsText(file)
    },
    [resetResults]
  )

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        loadSvgFile(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [loadSvgFile]
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) {
        loadSvgFile(file)
      }
    },
    [loadSvgFile]
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleCodeChange = useCallback(
    (value: string) => {
      setSvgCode(value)
      setOriginalSize((prev) => prev ?? getByteSize(value))
      resetResults()
    },
    [resetResults]
  )

  const handleOptimize = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }

    setOptimizing(true)
    try {
      const before = getByteSize(svgCode)
      const result = optimize(svgCode, { multipass: true })
      setSvgCode(result.data)
      setOriginalSize(before)
      setOptimizedSize(getByteSize(result.data))
      setCleanResult(null)
    } catch {
      // Optimization failed; keep original
    } finally {
      setOptimizing(false)
    }
  }, [svgCode])

  const handlePrettify = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }

    setSvgCode(prettifySvg(svgCode))
    resetResults()
  }, [resetResults, svgCode])

  const handleClean = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }

    const enabledPlugins = getEnabledCleanPlugins(cleanOptions, fileName)
    if (enabledPlugins.length === 0) {
      return
    }

    try {
      const beforeSize = getByteSize(svgCode)
      const result = optimize(svgCode, {
        multipass: false,
        plugins: enabledPlugins,
      })
      const formattedSvg = prettifySvg(result.data)
      setSvgCode(formattedSvg)
      setOptimizedSize(null)
      setCleanResult({
        beforeSize,
        cleanedSize: getByteSize(result.data),
        enabledCount: enabledPlugins.length,
        formattedSize: getByteSize(formattedSvg),
      })
    } catch {
      // Clean failed; keep original
    }
  }, [cleanOptions, fileName, svgCode])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(svgCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [svgCode])

  const handleDownload = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }

    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName || 'image.svg'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [fileName, svgCode])

  const openEditor = useCallback(() => {
    setEditorOpen(true)
  }, [])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const toggleAllCleanOptions = useCallback(() => {
    setCleanOptions(buildCleanOptions(allCleanEnabled ? [] : ALL_CLEAN_KEYS))
  }, [allCleanEnabled])

  const applyCleanPreset = useCallback((presetKey: CleanPresetKey) => {
    const preset = CLEAN_PRESETS.find((item) => item.key === presetKey)
    if (preset) {
      setCleanOptions(buildCleanOptions(preset.plugins))
    }
  }, [])

  const setCleanOption = useCallback(
    (key: CleanPluginKey, checked: boolean) => {
      setCleanOptions((prev: CleanOptions) => ({
        ...prev,
        [key]: checked,
      }))
    },
    []
  )

  return {
    activeCleanPreset,
    allCleanEnabled,
    bgMode,
    cleanOptions,
    cleanResult,
    cleanResultMeta,
    copied,
    editorRef,
    fileInputRef,
    fileName,
    hasSvg,
    isDragging,
    noneCleanEnabled,
    optimizing,
    originalSize,
    optimizedSize,
    showEditor,
    svgCode,
    actions: {
      applyCleanPreset,
      handleClean,
      handleCodeChange,
      handleCopy,
      handleDownload,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      handleOptimize,
      handlePrettify,
      openEditor,
      openFilePicker,
      setBgMode,
      setCleanOption,
      toggleAllCleanOptions,
    },
  }
}
