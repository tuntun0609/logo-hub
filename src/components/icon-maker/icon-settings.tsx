'use client'

import { ChevronDownIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from './color-picker'
import { GRADIENT_PRESETS } from './presets'
import type { FillType, IconMakerState } from './types'

interface IconSettingsProps {
  onBackgroundChange: (update: Partial<IconMakerState['background']>) => void
  onFillStylesChange: (update: Partial<IconMakerState['fillStyles']>) => void
  onIconStylesChange: (update: Partial<IconMakerState['iconStyles']>) => void
  onPresetSelect: (presetId: number) => void
  state: IconMakerState
}

const FILL_TYPES: { value: FillType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'solid', label: 'Solid' },
]

export function IconSettings({
  state,
  onFillStylesChange,
  onBackgroundChange,
  onIconStylesChange,
  onPresetSelect,
}: IconSettingsProps) {
  const { fillStyles, background, iconStyles } = state

  return (
    <div className="thin-scrollbar flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden">
      {/* Presets */}
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-medium text-sm">
          Presets
          <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              aria-label={`Preset ${preset.id + 1}`}
              className="aspect-square rounded border border-border transition-colors hover:opacity-90"
              key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              style={{
                background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
              }}
              type="button"
            />
          ))}
        </div>
      </details>

      {/* Fill Styles */}
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-medium text-sm">
          Fill Styles
          <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-fill-type"
            >
              Fill Type
            </label>
            <Select
              onValueChange={(v) =>
                onFillStylesChange({ fillType: v as FillType })
              }
              value={fillStyles.fillType}
            >
              <SelectTrigger className="w-full" id="setting-fill-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILL_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-primary-color"
            >
              Primary color
            </label>
            <ColorPicker
              onChange={(v) => onFillStylesChange({ primaryColor: v })}
              value={fillStyles.primaryColor}
            />
          </div>
          {fillStyles.fillType !== 'solid' && (
            <>
              <div>
                <label
                  className="mb-1 block text-muted-foreground text-xs"
                  htmlFor="setting-secondary-color"
                >
                  Secondary color
                </label>
                <ColorPicker
                  onChange={(v) => onFillStylesChange({ secondaryColor: v })}
                  value={fillStyles.secondaryColor}
                />
              </div>
              {fillStyles.fillType === 'linear' && (
                <div>
                  <label
                    className="mb-1 block text-muted-foreground text-xs"
                    htmlFor="setting-angle"
                  >
                    Angle (°)
                  </label>
                  <Input
                    id="setting-angle"
                    max={360}
                    min={0}
                    onChange={(e) =>
                      onFillStylesChange({
                        angle: Number(e.target.value) || 0,
                      })
                    }
                    type="number"
                    value={fillStyles.angle}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </details>

      {/* Background */}
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-medium text-sm">
          Background
          <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label
              className="text-muted-foreground text-xs"
              htmlFor="setting-radial-glare"
            >
              Radial glare
            </label>
            <Switch
              checked={background.radialGlare}
              id="setting-radial-glare"
              onCheckedChange={(v) => onBackgroundChange({ radialGlare: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label
              className="text-muted-foreground text-xs"
              htmlFor="setting-noise-texture"
            >
              Noise texture
            </label>
            <Switch
              checked={background.noiseTexture}
              id="setting-noise-texture"
              onCheckedChange={(v) => onBackgroundChange({ noiseTexture: v })}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-noise-opacity"
            >
              Noise opacity
            </label>
            <div className="relative">
              <Input
                className="pr-8"
                disabled={!background.noiseTexture}
                id="setting-noise-opacity"
                max={100}
                min={0}
                onChange={(e) =>
                  onBackgroundChange({
                    noiseOpacity: Number(e.target.value) || 0,
                  })
                }
                type="number"
                value={background.noiseOpacity}
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                %
              </span>
            </div>
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-radius"
            >
              Radius
            </label>
            <div className="relative">
              <Input
                className="pr-8"
                id="setting-radius"
                max={256}
                min={0}
                onChange={(e) =>
                  onBackgroundChange({
                    radius: Number(e.target.value) || 0,
                  })
                }
                type="number"
                value={background.radius}
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                px
              </span>
            </div>
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-stroke-size"
            >
              Stroke size
            </label>
            <div className="relative">
              <Input
                className="pr-8"
                id="setting-stroke-size"
                max={40}
                min={0}
                onChange={(e) =>
                  onBackgroundChange({
                    strokeSize: Number(e.target.value) || 0,
                  })
                }
                type="number"
                value={background.strokeSize}
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                px
              </span>
            </div>
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-stroke-color"
            >
              Stroke color
            </label>
            <ColorPicker
              disabled={background.strokeSize <= 0}
              onChange={(v) => onBackgroundChange({ strokeColor: v })}
              value={background.strokeColor}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-stroke-opacity"
            >
              Stroke opacity
            </label>
            <div className="relative">
              <Input
                className="pr-8"
                disabled={background.strokeSize <= 0}
                id="setting-stroke-opacity"
                max={100}
                min={0}
                onChange={(e) =>
                  onBackgroundChange({
                    strokeOpacity: Number(e.target.value) || 0,
                  })
                }
                type="number"
                value={background.strokeOpacity}
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
                %
              </span>
            </div>
          </div>
        </div>
      </details>

      {/* Icon */}
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-medium text-sm">
          Icon
          <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-icon-color"
            >
              Color
            </label>
            <ColorPicker
              onChange={(v) => onIconStylesChange({ color: v })}
              value={iconStyles.color}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-icon-size"
            >
              Size (px)
            </label>
            <Input
              id="setting-icon-size"
              max={512}
              min={16}
              onChange={(e) =>
                onIconStylesChange({
                  size: Number(e.target.value) || 256,
                })
              }
              type="number"
              value={iconStyles.size}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-x-offset"
            >
              X Offset (px)
            </label>
            <Input
              id="setting-x-offset"
              onChange={(e) =>
                onIconStylesChange({
                  xOffset: Number(e.target.value) || 0,
                })
              }
              type="number"
              value={iconStyles.xOffset}
            />
          </div>
          <div>
            <label
              className="mb-1 block text-muted-foreground text-xs"
              htmlFor="setting-y-offset"
            >
              Y Offset (px)
            </label>
            <Input
              id="setting-y-offset"
              onChange={(e) =>
                onIconStylesChange({
                  yOffset: Number(e.target.value) || 0,
                })
              }
              type="number"
              value={iconStyles.yOffset}
            />
          </div>
        </div>
      </details>
    </div>
  )
}
