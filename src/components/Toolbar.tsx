'use client'

import { useState, useEffect } from 'react'
import { MousePointer2, Square, Circle, Type, Minus, Hand, Frame, ZoomIn, ZoomOut } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { Tool } from '@/lib/types'

interface ToolItem {
  id: Tool
  icon: React.ComponentType<{ size?: number }>
  label: string
  shortcut: string
}

const DRAW_TOOLS: ToolItem[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'frame', icon: Frame, label: 'Frame', shortcut: 'F' },
  { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'O' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
]

interface ToolbarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

function useDark() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

function ToolBtn({
  active,
  onClick,
  title,
  children,
  className = 'w-10 h-10',
  isDark,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  className?: string
  isDark: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        className,
        'flex items-center justify-center rounded-xl',
        'transition-all duration-150 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
        !active && 'hover:scale-[1.05]',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        active
          ? {
              background: '#2563EB',
              color: '#ffffff',
              boxShadow: '0 0 0 1px rgba(37,99,235,0.3), 0 2px 8px rgba(37,99,235,0.35)',
            }
          : {
              background: 'transparent',
              color: isDark ? '#999' : '#555',
            }
      }
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function VDivider() {
  return <div className="w-5 h-px bg-black/[0.07] dark:bg-white/[0.08] my-0.5" />
}

function HDivider() {
  return <div className="h-5 w-px bg-black/[0.07] dark:bg-white/[0.08] mx-0.5" />
}

function getPillStyle(isDark: boolean): React.CSSProperties {
  return isDark
    ? {
        background: 'rgba(22, 22, 26, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }
    : {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow:
          '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      }
}

export function Toolbar({ onZoomIn, onZoomOut, onResetZoom }: ToolbarProps) {
  const { tool, setTool, stageScale } = useCanvasStore()
  const isDark = useDark()
  const zoomPercent = Math.round(stageScale * 100)
  const pillStyle = getPillStyle(isDark)
  const zoomBtnStyle: React.CSSProperties = {
    color: isDark ? '#888' : '#666',
  }

  return (
    <>
      {/* ── Desktop: vertical pill on the left ── */}
      <div
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-0.5 p-1.5 rounded-2xl"
        style={pillStyle}
        role="toolbar"
        aria-label="Drawing tools"
      >
        {DRAW_TOOLS.map((t) => (
          <ToolBtn
            key={t.id}
            active={tool === t.id}
            onClick={() => setTool(t.id)}
            title={`${t.label} (${t.shortcut})`}
            isDark={isDark}
          >
            <t.icon size={16} />
          </ToolBtn>
        ))}

        <VDivider />

        <ToolBtn onClick={onZoomOut} title="Zoom out" isDark={isDark}>
          <ZoomOut size={14} />
        </ToolBtn>

        <button
          onClick={onResetZoom}
          title="Reset zoom (100%)"
          className="h-8 px-1 min-w-[40px] flex items-center justify-center rounded-xl transition-all duration-150 font-mono text-[10px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          style={zoomBtnStyle}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          {zoomPercent}%
        </button>

        <ToolBtn onClick={onZoomIn} title="Zoom in" isDark={isDark}>
          <ZoomIn size={14} />
        </ToolBtn>
      </div>

      {/* ── Mobile: horizontal pill at bottom ── */}
      <div
        className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 p-1.5 rounded-2xl overflow-x-auto max-w-[calc(100vw-32px)]"
        style={pillStyle}
        role="toolbar"
        aria-label="Drawing tools"
      >
        {DRAW_TOOLS.map((t) => (
          <ToolBtn
            key={t.id}
            active={tool === t.id}
            onClick={() => setTool(t.id)}
            title={`${t.label} (${t.shortcut})`}
            className="w-11 h-11"
            isDark={isDark}
          >
            <t.icon size={16} />
          </ToolBtn>
        ))}

        <HDivider />

        <ToolBtn onClick={onZoomOut} title="Zoom out" className="w-11 h-11" isDark={isDark}>
          <ZoomOut size={14} />
        </ToolBtn>

        <button
          onClick={onResetZoom}
          title="Reset zoom"
          className="h-11 px-2 flex items-center justify-center rounded-xl transition-all duration-150 font-mono text-[10px] font-medium focus:outline-none"
          style={zoomBtnStyle}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          {zoomPercent}%
        </button>

        <ToolBtn onClick={onZoomIn} title="Zoom in" className="w-11 h-11" isDark={isDark}>
          <ZoomIn size={14} />
        </ToolBtn>
      </div>
    </>
  )
}
