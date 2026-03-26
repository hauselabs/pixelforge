'use client'

import { useState, useEffect } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'

interface BottomBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

const TOOL_LABELS: Record<string, string> = {
  select: 'Select',
  hand: 'Hand',
  rect: 'Rectangle',
  circle: 'Circle',
  text: 'Text',
  line: 'Line',
  frame: 'Frame',
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

export function BottomBar({ onZoomIn, onZoomOut, onResetZoom }: BottomBarProps) {
  const { tool, stageScale, objects, selectedId } = useCanvasStore()
  const isDark = useDark()
  const zoomPercent = Math.round(stageScale * 100)

  const bg = isDark
    ? 'linear-gradient(180deg, #18181b 0%, #111113 100%)'
    : '#FFFFFF'
  const border = isDark
    ? '1px solid rgba(255,255,255,0.06)'
    : '1px solid #EBEBEB'
  const labelColor = isDark ? '#555' : '#CCC'
  const valueColor = isDark ? '#aaa' : '#555'
  const mutedColor = isDark ? '#666' : '#999'
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5'
  const btnColor = isDark ? '#888' : '#777'
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'

  return (
    <footer
      style={{
        height: 32,
        background: bg,
        borderTop: border,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 0,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Tool indicator */}
      <div
        style={{
          fontSize: 11,
          color: mutedColor,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span style={{ color: labelColor }}>Tool:</span>
        <span style={{ color: valueColor, fontWeight: 500 }}>{TOOL_LABELS[tool] ?? tool}</span>
      </div>

      <div
        style={{
          width: 1,
          height: 14,
          background: dividerColor,
          margin: '0 10px',
        }}
      />

      {/* Object count */}
      <div style={{ fontSize: 11, color: mutedColor }}>
        <span style={{ color: labelColor }}>Objects:</span>{' '}
        <span style={{ color: valueColor, fontWeight: 500 }}>{objects.length}</span>
        {selectedId && (
          <span style={{ color: '#2563EB', marginLeft: 6 }}>• 1 selected</span>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          onClick={onZoomOut}
          title="Zoom out"
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: btnColor,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
          }}
        >
          <ZoomOut size={12} />
        </button>

        <button
          onClick={onResetZoom}
          title="Reset zoom (100%)"
          style={{
            minWidth: 44,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            color: valueColor,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
          }}
        >
          {zoomPercent}%
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom in"
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: btnColor,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
          }}
        >
          <ZoomIn size={12} />
        </button>

        <button
          onClick={onResetZoom}
          title="Fit to view"
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: btnColor,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
          }}
        >
          <Maximize2 size={11} />
        </button>
      </div>
    </footer>
  )
}
