import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface SvgCodeEditorProps {
  code: string
  onChange: (code: string) => void
}

export function SvgCodeEditor({ code, onChange }: SvgCodeEditorProps) {
  const [localCode, setLocalCode] = useState(code)

  useEffect(() => {
    setLocalCode(code)
  }, [code])

  const handleBlur = () => {
    if (localCode !== code) {
      onChange(localCode)
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <Textarea
        className="h-full w-full resize-none rounded-[1.25rem] border-border/70 bg-muted/20 px-4 py-3 font-mono text-xs leading-6 shadow-inner"
        onBlur={handleBlur}
        onChange={(e) => setLocalCode(e.target.value)}
        spellCheck={false}
        value={localCode}
      />
    </div>
  )
}
