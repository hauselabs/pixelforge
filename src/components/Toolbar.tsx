'use client'

import { MousePointer2, Square, Circle, Type, Minus, Image } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { Tool } from '@/lib/types'

interface ToolItem {
  id: Tool | 'image'
  icon: React.ReactNode
  label: string
  shortcut: string
}

const TOOLS: ToolItem[] = [
  { id: 'select', icon: <MousePointer2 size={16} />, label: 'Select', shortcut: 'V' },
  { id: 'rect', icon: <Square size={16} />, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: <Circle size={16} />, label: 'Circle', shortcut: 'O' },
  { id: 'text', icon: <Type size={16} />, label: 'Text', shortcut: 'T' },
  { id: 'line', icon: <Minus size={16} />, label: 'Line', shortcut: 'L' },
  { id: 'image', icon: <Image size={16} />, label: 'Image', shortcut: 'I' },
]

export function Toolbar() {
  const { tool, setTool } = useCanvasStore()

  return (
    <aside
      style={{
        width: 52,
        background: '#FFFFFF',
        borderRight: '1px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: 4,
        flexShrink: 0,
      }}
    >
      {TOOLS.map((t) => {
        const isActive = tool === t.id
        const isDisabled = t.id === 'image'

        return (
          <button
            key={t.id}
            title={`${t.label} (${t.shortcut})`}
            onClick={() => !isDisabled && setTool(t.id as Tool)}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 8,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              background: isActive ? '#0057FF' : 'transparent',
              color: isActive ? '#FFFFFF' : isDisabled ? '#CCCCCC' : '#555555',
              transition: 'all 0.1s',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isActive && !isDisabled)
                (e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            {t.icon}
          </button>
        )
      })}

      {/* Divider */}
      <div
        style={{
          width: 24,
          height: 1,
          background: '#EBEBEB',
          margin: '4px 0',
        }}
      />

      {/* Shortcut hint */}
      <div
        style={{
          fontSize: 9,
          color: '#CCC',
          fontWeight: 500,
          letterSpacing: '0.04em',
          marginTop: 4,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {TOOLS.filter((t) => t.id !== 'image').map((t) => (
          <div key={t.id} style={{ opacity: tool === t.id ? 0 : 1 }}>
            {t.shortcut}
          </div>
        ))}
      </div>
    </aside>
  )
}
