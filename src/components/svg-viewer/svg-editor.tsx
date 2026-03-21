'use client'

import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'
import { EditorView } from '@codemirror/view'
import CodeMirror from '@uiw/react-codemirror'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'

const baseTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': { overflow: 'auto' },
})

interface SvgEditorProps {
  lang?: 'javascript' | 'xml'
  onChange?: (value: string) => void
  readOnly?: boolean
  value: string
}

export function SvgEditor({
  lang = 'xml',
  onChange,
  readOnly = false,
  value,
}: SvgEditorProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const extensions = useMemo(
    () => [baseTheme, lang === 'xml' ? xml() : javascript({ jsx: true })],
    [lang]
  )

  return (
    <CodeMirror
      basicSetup={{
        bracketMatching: true,
        foldGutter: true,
        lineNumbers: true,
      }}
      editable={!readOnly}
      extensions={extensions}
      height="100%"
      onChange={onChange}
      readOnly={readOnly}
      theme={isDark ? 'dark' : 'light'}
      value={value}
    />
  )
}
