import { formatBytes, getByteSize } from '@/lib/svg-utils'
import type { CleanResult } from './types'

interface CleanResultMeta {
  className: string
  text: string
}

interface SvgViewerStatusBarProps {
  cleanResult: CleanResult | null
  cleanResultMeta: CleanResultMeta | null
  fileName: string | null
  hasSvg: boolean
  optimizedSize: number | null
  originalSize: number | null
  svgCode: string
}

export function SvgViewerStatusBar({
  cleanResult,
  cleanResultMeta,
  fileName,
  hasSvg,
  optimizedSize,
  originalSize,
  svgCode,
}: SvgViewerStatusBarProps) {
  if (!hasSvg) {
    return null
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2 py-1.5 text-muted-foreground text-xs sm:px-3">
      {fileName && <span className="font-medium">{fileName}</span>}
      {fileName && <span>·</span>}
      <span>
        {originalSize !== null
          ? `原始 ${formatBytes(originalSize)}`
          : `${formatBytes(getByteSize(svgCode))}`}
      </span>
      {optimizedSize !== null && originalSize !== null && (
        <>
          <span>→</span>
          <span>优化后 {formatBytes(optimizedSize)}</span>
          <span className="text-green-600 dark:text-green-400">
            （节省{' '}
            {Math.round(((originalSize - optimizedSize) / originalSize) * 100)}
            %）
          </span>
        </>
      )}
      {cleanResult && (
        <>
          <span>·</span>
          <span>清理 {cleanResult.enabledCount} 项</span>
          <span>→</span>
          <span>净体积 {formatBytes(cleanResult.cleanedSize)}</span>
          {cleanResultMeta && (
            <span className={cleanResultMeta.className}>
              {cleanResultMeta.text}
            </span>
          )}
          {cleanResult.formattedSize !== cleanResult.cleanedSize && (
            <span>当前展示 {formatBytes(cleanResult.formattedSize)}</span>
          )}
        </>
      )}
    </div>
  )
}
