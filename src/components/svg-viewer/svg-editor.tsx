'use client'

import { redo, undo } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { type CreateThemeOptions, createTheme } from '@uiw/codemirror-themes'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { useTheme } from 'next-themes'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

function buildTheme(isDark: boolean): ReturnType<typeof createTheme> {
  const options: CreateThemeOptions = {
    theme: isDark ? 'dark' : 'light',
    settings: {
      background: 'transparent',
      foreground: isDark ? 'oklch(0.985 0 0)' : 'oklch(0.145 0 0)',
      caret: isDark ? 'oklch(0.87 0 0)' : 'oklch(0.205 0 0)',
      selection: isDark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 7%)',
      selectionMatch: isDark ? 'oklch(1 0 0 / 5%)' : 'oklch(0 0 0 / 5%)',
      gutterBackground: 'transparent',
      gutterForeground: isDark ? 'oklch(0.5 0 0)' : 'oklch(0.6 0 0)',
      gutterBorder: 'transparent',
      lineHighlight: isDark ? 'oklch(1 0 0 / 4%)' : 'oklch(0 0 0 / 3%)',
      fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
      fontSize: '13px',
    },
    styles: isDark
      ? [
          { tag: tags.comment, color: 'oklch(0.55 0 0)' },
          { tag: tags.keyword, color: 'oklch(0.75 0.1 280)' },
          { tag: tags.string, color: 'oklch(0.75 0.12 150)' },
          { tag: tags.number, color: 'oklch(0.75 0.1 60)' },
          { tag: tags.tagName, color: 'oklch(0.78 0.1 220)' },
          { tag: tags.attributeName, color: 'oklch(0.72 0.1 280)' },
          { tag: tags.attributeValue, color: 'oklch(0.75 0.12 150)' },
          { tag: tags.punctuation, color: 'oklch(0.6 0 0)' },
          { tag: tags.operator, color: 'oklch(0.7 0 0)' },
          { tag: tags.typeName, color: 'oklch(0.78 0.1 60)' },
          { tag: tags.className, color: 'oklch(0.78 0.1 60)' },
          {
            tag: tags.function(tags.variableName),
            color: 'oklch(0.78 0.1 220)',
          },
          { tag: tags.propertyName, color: 'oklch(0.78 0.08 220)' },
          {
            tag: tags.definition(tags.variableName),
            color: 'oklch(0.8 0.08 220)',
          },
        ]
      : [
          { tag: tags.comment, color: 'oklch(0.55 0 0)' },
          { tag: tags.keyword, color: 'oklch(0.45 0.15 280)' },
          { tag: tags.string, color: 'oklch(0.45 0.15 150)' },
          { tag: tags.number, color: 'oklch(0.5 0.15 60)' },
          { tag: tags.tagName, color: 'oklch(0.5 0.12 220)' },
          { tag: tags.attributeName, color: 'oklch(0.45 0.12 280)' },
          { tag: tags.attributeValue, color: 'oklch(0.45 0.15 150)' },
          { tag: tags.punctuation, color: 'oklch(0.45 0 0)' },
          { tag: tags.operator, color: 'oklch(0.4 0 0)' },
          { tag: tags.typeName, color: 'oklch(0.5 0.12 60)' },
          { tag: tags.className, color: 'oklch(0.5 0.12 60)' },
          {
            tag: tags.function(tags.variableName),
            color: 'oklch(0.5 0.12 220)',
          },
          { tag: tags.propertyName, color: 'oklch(0.48 0.1 220)' },
          {
            tag: tags.definition(tags.variableName),
            color: 'oklch(0.5 0.1 220)',
          },
        ],
  }
  return createTheme(options)
}

export interface SvgEditorHandle {
  redo: () => void
  undo: () => void
}

interface SvgEditorProps {
  lang?: 'javascript' | 'xml'
  onChange?: (value: string) => void
  readOnly?: boolean
  value: string
}

export const SvgEditor = forwardRef<SvgEditorHandle, SvgEditorProps>(
  function SvgEditor({ lang = 'xml', onChange, readOnly = false, value }, ref) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    const cmRef = useRef<ReactCodeMirrorRef>(null)

    const theme = useMemo(() => buildTheme(isDark), [isDark])

    const extensions = useMemo(
      () => [
        EditorView.lineWrapping,
        lang === 'xml' ? xml() : javascript({ jsx: true }),
      ],
      [lang]
    )

    useImperativeHandle(ref, () => ({
      undo: () => {
        const view = cmRef.current?.view
        if (view) {
          undo(view)
        }
      },
      redo: () => {
        const view = cmRef.current?.view
        if (view) {
          redo(view)
        }
      },
    }))

    return (
      <div className="relative min-h-0 flex-1">
        <div className="h-full w-full overflow-auto">
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
            ref={cmRef}
            theme={theme}
            value={value}
          />
        </div>
      </div>
    )
  }
)
