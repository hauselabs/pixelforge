'use client'

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'

interface BottomBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

const TOOL_LABELS: Record<string, string> = {
  select: 'Select',
  rect: 'Rectangle',
  circle: 'Circle',
  text: 'Text',
  line: 'Line',
}

export function BottomBar({ onZoomIn, onZoomOut, onResetZoom }: BottomBarProps) {
  const { tool, stageScale, objects, selectedId } = useCanvasStore()
  const zoomPercent = Math.round(stageScale * 100)

  return (
    <footer
      style={{
        height: 32,
        background: '#FFFFFF',
        borderTop: '1px solid #EBEBEB',
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
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span style={{ color: '#CCC' }}>Tool:</span>
        <span style={{ color: '#555', fontWeight: 500 }}>{TOOL_LABELS[tool] ?? tool}</span>
      </div>

      <div
        style={{
          width: 1,
          height: 14,
          background: '#E5E5E5',
          margin: '0 10px',
        }}
      />

      {/* Object count */}
      <div style={{ fontSize: 11, color: '#999' }}>
        <span style={{ color: '#CCC' }}>Objects:</span>{' '}
        <span style={{ color: '#555', fontWeight: 500 }}>{objects.length}</span>
        {selectedId && (
          <span style={{ color: '#0057FF', marginLeft: 6 }}>• 1 selected</span>
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
            color: '#777',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
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
            color: '#555',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
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
            color: '#777',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
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
            color: '#777',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
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
