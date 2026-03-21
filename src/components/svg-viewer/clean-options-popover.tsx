'use client'

import { ChevronDown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  CLEAN_PLUGINS,
  CLEAN_PRESETS,
  type CleanOptions,
  type CleanPluginKey,
  type CleanPresetKey,
} from './cleaning'

interface CleanOptionsPopoverProps {
  activeCleanPreset: CleanPresetKey | null
  allCleanEnabled: boolean
  cleanOptions: CleanOptions
  disabled: boolean
  onApplyCleanPreset: (presetKey: CleanPresetKey) => void
  onOptionChange: (key: CleanPluginKey, checked: boolean) => void
  onToggleAll: () => void
}

export function CleanOptionsPopover({
  activeCleanPreset,
  allCleanEnabled,
  cleanOptions,
  disabled,
  onApplyCleanPreset,
  onOptionChange,
  onToggleAll,
}: CleanOptionsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ size: 'icon-xs', variant: 'ghost' }),
          'rounded-l-none px-0.5'
        )}
        disabled={disabled}
      >
        <ChevronDown className="size-3" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-[min(75vh,36rem)] w-80 overflow-x-hidden overflow-y-hidden p-2"
      >
        <div className="max-h-[calc(min(75vh,36rem)-1rem)] overflow-y-auto overflow-x-hidden pr-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <span className="font-medium text-xs">清理选项</span>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                参考 SVGO / SVGOMG 的常用方案
              </p>
            </div>
            <button
              className="text-muted-foreground text-xs hover:text-foreground"
              onClick={onToggleAll}
              type="button"
            >
              {allCleanEnabled ? '全不选' : '全选'}
            </button>
          </div>

          <div className="mb-2">
            <p className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">
              预设
            </p>
            <div className="grid grid-cols-2 gap-1">
              {CLEAN_PRESETS.map((preset) => (
                <button
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-left transition-colors',
                    activeCleanPreset === preset.key
                      ? 'border-primary bg-primary/8'
                      : 'border-border hover:bg-muted'
                  )}
                  key={preset.key}
                  onClick={() => onApplyCleanPreset(preset.key)}
                  type="button"
                >
                  <div className="font-medium text-xs">{preset.label}</div>
                  <div className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {CLEAN_PLUGINS.map((group) => (
            <div key={group.group}>
              <p className="mt-1.5 mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                {group.group}
              </p>
              {group.items.map((item) => (
                <div
                  className="flex cursor-pointer items-center justify-between rounded px-1.5 py-1 hover:bg-muted"
                  key={item.key}
                >
                  <span className="text-xs">{item.label}</span>
                  <Switch
                    checked={cleanOptions[item.key]}
                    onCheckedChange={(checked) =>
                      onOptionChange(item.key, checked)
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ))}

          <p className="mt-2 text-[10px] text-muted-foreground leading-4">
            `removeViewBox` 可能影响缩放，`removeTitle` / `removeDesc`
            会影响可访问性，默认只放在特定预设里。
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
