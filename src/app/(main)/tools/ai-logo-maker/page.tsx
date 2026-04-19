'use client'

import { ChevronDown, Copy, Download } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ChatPanel } from '@/components/ai-logo-maker/chat-panel'
import { PreviewPanel } from '@/components/ai-logo-maker/preview-panel'
import { useAiLogoMaker } from '@/components/ai-logo-maker/use-ai-logo-maker'
import { ToolPanel } from '@/components/tool-shell'
import { ArrowLeftIcon } from '@/components/ui/arrow-left'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AiLogoMakerPage() {
  const {
    messages,
    currentSvg,
    isGenerating,
    selectedStyle,
    editMode,
    handleGenerate,
    handleDownload,
    handleCopy,
    handleExportPng,
    setSelectedStyle,
    setEditMode,
    updateSvg,
  } = useAiLogoMaker()

  const [showCopied, setShowCopied] = useState(false)

  const handleCopyClick = async () => {
    const success = await handleCopy()
    if (success) {
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  const handleExportClick = (size: number) => {
    handleExportPng(size)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 md:h-[calc(100svh-3rem)] md:flex-none md:overflow-hidden">
      <div className="flex shrink-0 items-center">
        <Link
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-3 font-medium text-muted-foreground text-xs transition hover:bg-muted hover:text-foreground"
          href="/tools"
        >
          <ArrowLeftIcon size={15} />
          返回工具库
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[22rem_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[24rem_minmax(0,1fr)] md:[grid-template-rows:minmax(0,1fr)]">
        <ToolPanel className="min-h-[32rem] overflow-hidden p-0 md:h-full md:min-h-0">
          <ChatPanel
            isGenerating={isGenerating}
            messages={messages}
            onSend={handleGenerate}
            onStyleChange={setSelectedStyle}
            selectedStyle={selectedStyle}
          />
        </ToolPanel>

        <ToolPanel className="min-h-[32rem] overflow-hidden p-0 md:h-full md:min-h-0">
          <PreviewPanel
            actions={
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <Button
                  disabled={!currentSvg}
                  onClick={handleCopyClick}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="size-3.5" />
                  {showCopied ? '已复制' : '复制'}
                </Button>
                <Button
                  disabled={!currentSvg}
                  onClick={handleDownload}
                  size="sm"
                  variant="outline"
                >
                  <Download className="size-3.5" />
                  SVG
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={(triggerProps) => (
                      <Button
                        disabled={!currentSvg}
                        size="sm"
                        variant="outline"
                        {...triggerProps}
                      >
                        PNG
                        <ChevronDown className="size-3.5" />
                      </Button>
                    )}
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportClick(256)}>
                      256×256
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportClick(512)}>
                      512×512
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportClick(1024)}>
                      1024×1024
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
            editMode={editMode}
            onEditModeChange={setEditMode}
            onSvgChange={updateSvg}
            svgCode={currentSvg}
          />
        </ToolPanel>
      </div>
    </div>
  )
}
