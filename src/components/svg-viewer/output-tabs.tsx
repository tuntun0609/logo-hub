'use client'

import { Check, Copy, Download } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  formatBytes,
  parseSvgDimensions,
  svgToBase64DataUri,
  svgToDataUri,
  svgToPng,
  svgToReactJsx,
  svgToReactNative,
} from '@/lib/svg-utils'
import { cn } from '@/lib/utils'
import { SvgEditor } from './svg-editor'
import { SvgPreview } from './svg-preview'

type Tab = 'data-uri' | 'png' | 'preview' | 'react' | 'react-native'
type BgMode = 'checkerboard' | 'dark' | 'white'

const TABS: { label: string; value: Tab }[] = [
  { label: '预览', value: 'preview' },
  { label: 'React', value: 'react' },
  { label: 'React Native', value: 'react-native' },
  { label: 'PNG', value: 'png' },
  { label: 'Data URI', value: 'data-uri' },
]

interface OutputTabsProps {
  bgMode: BgMode
  onBgModeChange: (mode: BgMode) => void
  svg: string
}

export function OutputTabs({ bgMode, onBgModeChange, svg }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview')

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
      {/* Tab bar */}
      <div className="flex shrink-0 items-center gap-0.5 border-b px-2 py-1">
        {TABS.map((tab) => (
          <button
            className={cn(
              'rounded-md px-2.5 py-1 font-medium text-xs transition-colors',
              activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <SvgPreview
            bgMode={bgMode}
            onBgModeChange={onBgModeChange}
            svg={svg}
          />
        )}
        {activeTab === 'react' && <ReactJsxTab svg={svg} />}
        {activeTab === 'react-native' && <ReactNativeTab svg={svg} />}
        {activeTab === 'png' && <PngTab svg={svg} />}
        {activeTab === 'data-uri' && <DataUriTab svg={svg} />}
      </div>
    </div>
  )
}

// ─── Shared copy button ──────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [text])

  return (
    <Button onClick={handleCopy} size="sm" variant="outline">
      {copied ? (
        <>
          <Check className="size-3.5" />
          已复制
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          复制
        </>
      )}
    </Button>
  )
}

// ─── React JSX Tab ───────────────────────────────────────

function ReactJsxTab({ svg }: { svg: string }) {
  const jsx = useMemo(() => (svg ? svgToReactJsx(svg) : ''), [svg])

  if (!svg) {
    return <EmptyHint />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 border-b px-3 py-1.5">
        <CopyButton text={jsx} />
      </div>
      <div className="min-h-0 flex-1">
        <SvgEditor lang="javascript" readOnly value={jsx} />
      </div>
    </div>
  )
}

// ─── React Native Tab ────────────────────────────────────

function ReactNativeTab({ svg }: { svg: string }) {
  const rn = useMemo(() => (svg ? svgToReactNative(svg) : ''), [svg])

  if (!svg) {
    return <EmptyHint />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 border-b px-3 py-1.5">
        <CopyButton text={rn} />
      </div>
      <div className="min-h-0 flex-1">
        <SvgEditor lang="javascript" readOnly value={rn} />
      </div>
    </div>
  )
}

// ─── PNG Tab ─────────────────────────────────────────────

function PngTab({ svg }: { svg: string }) {
  const dims = useMemo(() => (svg ? parseSvgDimensions(svg) : null), [svg])
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [locked, setLocked] = useState(true)
  const aspectRef = useRef(1)
  const [pngUrl, setPngUrl] = useState<string | null>(null)

  useEffect(() => {
    if (dims) {
      setWidth(Math.round(dims.width))
      setHeight(Math.round(dims.height))
      aspectRef.current = dims.width / dims.height
    }
  }, [dims])

  // Generate PNG preview
  useEffect(() => {
    if (!svg || width <= 0 || height <= 0) {
      setPngUrl(null)
      return
    }
    let cancelled = false
    svgToPng(svg, width, height).then((blob) => {
      if (cancelled) {
        return
      }
      const url = URL.createObjectURL(blob)
      setPngUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return url
      })
    })
    return () => {
      cancelled = true
    }
  }, [svg, width, height])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pngUrl) {
        URL.revokeObjectURL(pngUrl)
      }
    }
  }, [pngUrl])

  const handleWidthChange = useCallback(
    (val: string) => {
      const w = Math.max(1, Number.parseInt(val, 10) || 1)
      setWidth(w)
      if (locked) {
        setHeight(Math.round(w / aspectRef.current))
      }
    },
    [locked]
  )

  const handleHeightChange = useCallback(
    (val: string) => {
      const h = Math.max(1, Number.parseInt(val, 10) || 1)
      setHeight(h)
      if (locked) {
        setWidth(Math.round(h * aspectRef.current))
      }
    },
    [locked]
  )

  const handleDownload = useCallback(() => {
    if (!svg) {
      return
    }
    svgToPng(svg, width, height).then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `svg-export-${width}x${height}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [svg, width, height])

  if (!svg) {
    return <EmptyHint />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-1.5">
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          宽
          <Input
            className="h-6 w-16 px-1.5 text-xs"
            min={1}
            onChange={(e) => handleWidthChange(e.target.value)}
            type="number"
            value={width}
          />
        </span>
        <button
          className={cn(
            'text-xs',
            locked ? 'text-foreground' : 'text-muted-foreground'
          )}
          onClick={() => setLocked((v) => !v)}
          title={locked ? '解锁比例' : '锁定比例'}
          type="button"
        >
          {locked ? '🔗' : '🔓'}
        </button>
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          高
          <Input
            className="h-6 w-16 px-1.5 text-xs"
            min={1}
            onChange={(e) => handleHeightChange(e.target.value)}
            type="number"
            value={height}
          />
        </span>
        <Button onClick={handleDownload} size="sm" variant="outline">
          <Download className="size-3.5" />
          下载 PNG
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto bg-checkerboard p-4">
        {pngUrl ? (
          <img
            alt="PNG preview"
            className="max-h-full max-w-full object-contain"
            height={height}
            src={pngUrl}
            width={width}
          />
        ) : (
          <p className="text-muted-foreground text-sm">生成中...</p>
        )}
      </div>
    </div>
  )
}

// ─── Data URI Tab ────────────────────────────────────────

function DataUriTab({ svg }: { svg: string }) {
  const [mode, setMode] = useState<'base64' | 'url'>('url')
  const uri = useMemo(() => {
    if (!svg) {
      return ''
    }
    return mode === 'url' ? svgToDataUri(svg) : svgToBase64DataUri(svg)
  }, [svg, mode])

  if (!svg) {
    return <EmptyHint />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            className={cn(
              'rounded-md px-2 py-0.5 text-xs transition-colors',
              mode === 'url'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={() => setMode('url')}
            type="button"
          >
            URL Encoded
          </button>
          <button
            className={cn(
              'rounded-md px-2 py-0.5 text-xs transition-colors',
              mode === 'base64'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={() => setMode('base64')}
            type="button"
          >
            Base64
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {formatBytes(uri.length)}
          </span>
          <CopyButton text={uri} />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <textarea
          className="h-full w-full resize-none break-all rounded-md border bg-muted/50 p-2 font-mono text-xs"
          readOnly
          value={uri}
        />
      </div>
    </div>
  )
}

// ─── Empty hint ──────────────────────────────────────────

function EmptyHint() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground text-sm">请先输入 SVG 代码</p>
    </div>
  )
}
