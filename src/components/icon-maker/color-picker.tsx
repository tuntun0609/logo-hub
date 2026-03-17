'use client'

import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,6}$/
const HEX6_RE = /^#[0-9a-fA-F]{6}$/
const HEX3_RE = /^#[0-9a-fA-F]{3}$/

interface ColorPickerProps {
  className?: string
  disabled?: boolean
  label?: string
  onChange: (hex: string) => void
  value: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  disabled,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const normalizedHex = (() => {
    if (!(value.startsWith('#') && HEX_COLOR_RE.test(value))) {
      return '#000000'
    }
    if (value.length === 4) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
    }
    return value
  })()

  const handleNativeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      setInputValue(hex)
      onChange(hex)
    },
    [onChange]
  )

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setInputValue(v)
      if (HEX6_RE.test(v) || HEX3_RE.test(v)) {
        onChange(v)
      }
    },
    [onChange]
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setInputValue(value)
      }
    },
    [value]
  )

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        render={(triggerProps) => (
          <button
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors hover:bg-muted disabled:opacity-50',
              className
            )}
            disabled={disabled}
            type="button"
            {...triggerProps}
          >
            <span
              className="size-4 shrink-0 rounded border border-border"
              style={{ backgroundColor: normalizedHex }}
            />
            <span className="font-mono text-muted-foreground text-xs">
              {normalizedHex}
            </span>
          </button>
        )}
      />
      <PopoverContent align="start" className="w-56">
        <div className="flex flex-col gap-3">
          {label && <p className="font-medium text-sm">{label}</p>}
          <div className="flex gap-2">
            <input
              className="h-10 w-full cursor-pointer rounded border border-input bg-transparent p-0"
              onChange={handleNativeChange}
              type="color"
              value={normalizedHex}
            />
            <Input
              className="font-mono text-xs"
              onChange={handleHexInputChange}
              placeholder="#000000"
              value={inputValue}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
