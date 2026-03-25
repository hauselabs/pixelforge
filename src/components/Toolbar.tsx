'use client'

import { MousePointer2, Square, Circle, Type, Minus, ZoomIn, ZoomOut } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { Tool } from '@/lib/types'

interface ToolItem {
  id: Tool
  icon: React.ComponentType<{ size?: number }>
  label: string
  shortcut: string
}

const TOOLS: ToolItem[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
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

export function Toolbar({ onZoomIn, onZoomOut, onResetZoom }: ToolbarProps) {
  const { tool, setTool, stageScale } = useCanvasStore()
  const zoomPercent = Math.round(stageScale * 100)

  const toolBtnBase =
    'flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]'

  const toolBtnActive = 'bg-[#0057FF] text-white shadow-sm'
  const toolBtnIdle =
    'text-[#555] dark:text-[#999] hover:bg-[#F0F0F0] dark:hover:bg-[#1E1E1E]'

  const pillBase =
    'bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A] shadow-lg shadow-black/5 dark:shadow-black/25 rounded-2xl p-1.5'

  return (
    <>
      {/* ── Desktop: vertical pill on the left ── */}
      <div
        className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-1 ${pillBase}`}
        role="toolbar"
        aria-label="Drawing tools"
      >
        {TOOLS.map((t) => (
          <button
            key={t.id}
            title={`${t.label} (${t.shortcut})`}
            onClick={() => setTool(t.id)}
            className={`w-10 h-10 ${toolBtnBase} ${tool === t.id ? toolBtnActive : toolBtnIdle}`}
          >
            <t.icon size={16} />
          </button>
        ))}

        {/* Divider */}
        <div className="w-6 h-px bg-[#E5E5E5] dark:bg-[#2A2A2A] my-0.5" />

        {/* Zoom controls */}
        <button
          onClick={onZoomOut}
          title="Zoom out"
          className={`w-10 h-10 ${toolBtnBase} ${toolBtnIdle}`}
        >
          <ZoomOut size={14} />
        </button>

        <button
          onClick={onResetZoom}
          title="Reset zoom (100%)"
          className={`h-8 px-1 min-w-[40px] flex items-center justify-center rounded-xl transition-all duration-150 font-mono text-[10px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF] ${toolBtnIdle}`}
        >
          {zoomPercent}%
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom in"
          className={`w-10 h-10 ${toolBtnBase} ${toolBtnIdle}`}
        >
          <ZoomIn size={14} />
        </button>
      </div>

      {/* ── Mobile: horizontal bottom bar ── */}
      <div
        className={`md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 ${pillBase}`}
        role="toolbar"
        aria-label="Drawing tools"
      >
        {TOOLS.map((t) => (
          <button
            key={t.id}
            title={`${t.label} (${t.shortcut})`}
            onClick={() => setTool(t.id)}
            className={`w-11 h-11 ${toolBtnBase} ${tool === t.id ? toolBtnActive : toolBtnIdle}`}
          >
            <t.icon size={16} />
          </button>
        ))}

        {/* Divider */}
        <div className="h-6 w-px bg-[#E5E5E5] dark:bg-[#2A2A2A] mx-0.5" />

        <button
          onClick={onZoomOut}
          title="Zoom out"
          className={`w-11 h-11 ${toolBtnBase} ${toolBtnIdle}`}
        >
          <ZoomOut size={14} />
        </button>

        <button
          onClick={onResetZoom}
          title="Reset zoom"
          className={`h-11 px-2 flex items-center justify-center rounded-xl transition-all duration-150 font-mono text-[10px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF] ${toolBtnIdle}`}
        >
          {zoomPercent}%
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom in"
          className={`w-11 h-11 ${toolBtnBase} ${toolBtnIdle}`}
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </>
  )
}
