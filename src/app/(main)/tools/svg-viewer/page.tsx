'use client'

import { Check, Copy, Download, Upload } from 'lucide-react'
import { OutputTabs } from '@/components/svg-viewer/output-tabs'
import { SvgViewerEditorPane } from '@/components/svg-viewer/svg-viewer-editor-pane'
import { SvgViewerStatusBar } from '@/components/svg-viewer/svg-viewer-status-bar'
import { useSvgViewer } from '@/components/svg-viewer/use-svg-viewer'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'

export default function SvgViewerPage() {
  const {
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
    actions,
  } = useSvgViewer()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:h-[calc(100svh-2rem)] md:flex-none md:gap-3">
      <ToolHeader
        actions={
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:justify-start">
            <input
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={actions.handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <Button
              aria-label="上传 SVG"
              onClick={actions.openFilePicker}
              size="sm"
              variant="ghost"
            >
              <Upload className="size-3.5" />
              上传
            </Button>
            <Button
              disabled={!hasSvg}
              onClick={actions.handleCopy}
              size="sm"
              variant="ghost"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? '已复制' : '复制'}
            </Button>
            <Button
              disabled={!hasSvg}
              onClick={actions.handleDownload}
              size="sm"
              variant="outline"
            >
              <Download className="size-3.5" />
              下载
            </Button>
          </div>
        }
        description="浏览、编辑、优化 SVG 并转换为多种格式"
        meta={['SVG 编辑', '优化清理', '多格式输出']}
        title="SVG Viewer"
        variant="compact"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden md:flex-row md:gap-2 md:overflow-hidden">
        <SvgViewerEditorPane
          activeCleanPreset={activeCleanPreset}
          allCleanEnabled={allCleanEnabled}
          cleanOptions={cleanOptions}
          editorRef={editorRef}
          hasSvg={hasSvg}
          isDragging={isDragging}
          noneCleanEnabled={noneCleanEnabled}
          onApplyCleanPreset={actions.applyCleanPreset}
          onClean={actions.handleClean}
          onCodeChange={actions.handleCodeChange}
          onDragLeave={actions.handleDragLeave}
          onDragOver={actions.handleDragOver}
          onDrop={actions.handleDrop}
          onOpenEditor={actions.openEditor}
          onOptimize={actions.handleOptimize}
          onOptionChange={actions.setCleanOption}
          onPrettify={actions.handlePrettify}
          onToggleAllCleanOptions={actions.toggleAllCleanOptions}
          onUploadClick={actions.openFilePicker}
          optimizing={optimizing}
          showEditor={showEditor}
          svgCode={svgCode}
        />
        <div className="flex h-[min(max(36svh,160px),260px)] min-w-0 shrink-0 flex-col md:h-auto md:min-h-0 md:w-1/2 md:flex-1">
          <OutputTabs
            bgMode={bgMode}
            onBgModeChange={actions.setBgMode}
            svg={svgCode}
          />
        </div>
      </div>

      <SvgViewerStatusBar
        cleanResult={cleanResult}
        cleanResultMeta={cleanResultMeta}
        fileName={fileName}
        hasSvg={hasSvg}
        optimizedSize={optimizedSize}
        originalSize={originalSize}
        svgCode={svgCode}
      />
    </div>
  )
}
