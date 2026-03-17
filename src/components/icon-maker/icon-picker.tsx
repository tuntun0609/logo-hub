'use client'

import { FileUp, Search, Type } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { IconSourceType } from './types'

const ICON_DISPLAY_SIZE = 20

interface IconPickerProps {
  customText: string
  iconId: string | null
  iconSourceType: IconSourceType
  onCustomTextChange: (text: string) => void
  onSelectIcon: (iconId: string) => void
  onSourceTypeChange: (type: IconSourceType) => void
  onUploadSvg: (url: string) => void
}

type DynamicImports = Record<
  string,
  () => Promise<{ default: React.ComponentType<{ size?: number }> }>
>

let dynamicImportsCache: DynamicImports | null = null

function getDynamicImports(): Promise<DynamicImports> {
  if (dynamicImportsCache) {
    return Promise.resolve(dynamicImportsCache)
  }
  return import('lucide-react/dynamicIconImports').then((mod) => {
    dynamicImportsCache = mod.default as DynamicImports
    return dynamicImportsCache
  })
}

function LazyIcon({
  name,
  isSelected,
  onClick,
}: {
  isSelected: boolean
  name: string
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [Icon, setIcon] = useState<React.ComponentType<{
    size?: number
    className?: string
  }> | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (Icon || loadingRef.current) {
      return
    }
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return
        }
        observer.disconnect()
        loadingRef.current = true
        getDynamicImports().then((imports) => {
          const loader = imports[name]
          if (!loader) {
            return
          }
          loader().then((mod) => setIcon(() => mod.default))
        })
      },
      { rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [name, Icon])

  return (
    <button
      aria-label={name}
      aria-pressed={isSelected}
      className={cn(
        'flex aspect-square items-center justify-center rounded-lg border transition-colors',
        isSelected
          ? 'border-primary bg-primary/20 text-primary'
          : 'border-transparent bg-muted/60 hover:bg-muted'
      )}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      {Icon ? (
        <Icon size={ICON_DISPLAY_SIZE} />
      ) : (
        <span className="text-[10px] text-muted-foreground">
          {name.slice(0, 2)}
        </span>
      )}
    </button>
  )
}

export function IconPicker({
  iconId,
  iconSourceType,
  customText,
  onSelectIcon,
  onSourceTypeChange,
  onCustomTextChange,
  onUploadSvg,
}: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [iconNames, setIconNames] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    getDynamicImports().then((imports) => {
      if (cancelled) {
        return
      }
      const keys = Object.keys(imports)
      setIconNames(keys.sort((a, b) => a.localeCompare(b)))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredNames = useMemo(() => {
    if (!search.trim()) {
      return iconNames
    }
    const q = search.trim().toLowerCase()
    return iconNames.filter((name) => name.toLowerCase().includes(q))
  }, [iconNames, search])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file?.type.includes('svg')) {
        return
      }
      const url = URL.createObjectURL(file)
      onUploadSvg(url)
      e.target.value = ''
    },
    [onUploadSvg]
  )

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 items-center gap-1">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            value={search}
          />
        </div>
        <button
          aria-label="Text mode"
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors',
            iconSourceType === 'text'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-muted'
          )}
          onClick={() => onSourceTypeChange('text')}
          type="button"
        >
          <Type className="size-4" />
        </button>
        <label className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border transition-colors hover:bg-muted">
          <FileUp className="size-4" />
          <input
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </div>

      {iconSourceType === 'text' && (
        <div className="shrink-0">
          <label
            className="mb-1 block text-muted-foreground text-xs"
            htmlFor="icon-custom-text"
          >
            Text
          </label>
          <Input
            id="icon-custom-text"
            maxLength={2}
            onChange={(e) => onCustomTextChange(e.target.value.slice(0, 2))}
            placeholder="Aa"
            value={customText}
          />
        </div>
      )}

      <h4 className="shrink-0 font-medium text-sm">All Icons</h4>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-4 gap-2">
          {filteredNames.slice(0, 500).map((name) => (
            <LazyIcon
              isSelected={iconSourceType === 'lucide' && iconId === name}
              key={name}
              name={name}
              onClick={() => onSelectIcon(name)}
            />
          ))}
        </div>
        {filteredNames.length > 500 && (
          <p className="py-2 text-center text-muted-foreground text-xs">
            Showing first 500. Refine search for more.
          </p>
        )}
      </div>
    </div>
  )
}
