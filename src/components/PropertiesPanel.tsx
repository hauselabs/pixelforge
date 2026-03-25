'use client'

import { useState } from 'react'
import { Trash2, ChevronRight, ChevronLeft, GripHorizontal } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { CanvasObject } from '@/lib/types'

/* ── Sub-components ───────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-3 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
      <div className="text-[9px] font-semibold text-[#AAAAAA] dark:text-[#555] tracking-[0.06em] uppercase mb-2.5">
        {title}
      </div>
      {children}
    </div>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center mb-1.5 gap-2">
      <span className="text-[11px] text-[#888] dark:text-[#666] w-14 flex-shrink-0 font-normal">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <input
      type="number"
      value={Math.round(value * 100) / 100}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-2 py-1 border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-md text-[11px] font-mono text-[#0A0A0A] dark:text-[#F0F0F0] bg-[#FAFAFA] dark:bg-[#0E0E0E] outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]/20 transition-all duration-150"
    />
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isGradient = value?.startsWith('linear-gradient') || value?.startsWith('radial-gradient')
  return (
    <div className="flex items-center gap-1.5">
      {isGradient ? (
        <div
          className="w-5 h-5 rounded flex-shrink-0 border border-black/10"
          style={{ background: value }}
        />
      ) : (
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 border border-[#E0E0E0] dark:border-[#2A2A2A] rounded p-0.5 cursor-pointer bg-none flex-shrink-0"
        />
      )}
      <input
        type="text"
        value={isGradient ? '(gradient)' : value}
        onChange={(e) => !isGradient && onChange(e.target.value)}
        readOnly={isGradient}
        className="flex-1 px-1.5 py-1 border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-md text-[11px] font-mono text-[#0A0A0A] dark:text-[#F0F0F0] bg-[#FAFAFA] dark:bg-[#0E0E0E] outline-none focus:border-[#0057FF] transition-all duration-150"
      />
    </div>
  )
}

/* ── Panel content ───────────────────────────────────────────────────── */

function PanelContent({
  obj,
  onUpdate,
  onDelete,
}: {
  obj: CanvasObject
  onUpdate: (updates: Partial<CanvasObject>) => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E] flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[11px] font-semibold text-[#0A0A0A] dark:text-[#F0F0F0] tracking-tight">
            {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
          </div>
          <div className="text-[9px] text-[#BBB] dark:text-[#555] font-mono mt-0.5">
            {obj.id.slice(0, 8)}…
          </div>
        </div>
        <button
          onClick={onDelete}
          title="Delete object"
          className="w-7 h-7 flex items-center justify-center border-none bg-transparent rounded-md cursor-pointer text-[#FF4545] hover:bg-[#FFF0F0] dark:hover:bg-[#2A1010] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Position */}
      <Section title="Position">
        <PropRow label="X">
          <NumInput value={obj.x} onChange={(v) => onUpdate({ x: v })} />
        </PropRow>
        <PropRow label="Y">
          <NumInput value={obj.y} onChange={(v) => onUpdate({ y: v })} />
        </PropRow>
        <PropRow label="Rotate">
          <NumInput value={obj.rotation} onChange={(v) => onUpdate({ rotation: v })} min={-360} max={360} />
        </PropRow>
      </Section>

      {/* Size */}
      {(obj.type === 'rect' || obj.type === 'line') && (
        <Section title="Size">
          <PropRow label="Width">
            <NumInput value={obj.width ?? 0} onChange={(v) => onUpdate({ width: Math.max(1, v) })} min={1} />
          </PropRow>
          {obj.type === 'rect' && (
            <PropRow label="Height">
              <NumInput value={obj.height ?? 0} onChange={(v) => onUpdate({ height: Math.max(1, v) })} min={1} />
            </PropRow>
          )}
        </Section>
      )}

      {obj.type === 'circle' && (
        <Section title="Size">
          <PropRow label="Radius">
            <NumInput value={obj.radius ?? 50} onChange={(v) => onUpdate({ radius: Math.max(1, v) })} min={1} />
          </PropRow>
        </Section>
      )}

      {obj.type === 'text' && (
        <Section title="Text">
          <div className="mb-1.5">
            <textarea
              value={obj.text ?? ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={3}
              className="w-full px-2 py-1.5 border border-[#E8E8E8] dark:border-[#2A2A2A] rounded-md text-[12px] text-[#0A0A0A] dark:text-[#F0F0F0] bg-[#FAFAFA] dark:bg-[#0E0E0E] outline-none focus:border-[#0057FF] resize-y font-sans transition-all duration-150"
            />
          </div>
          <PropRow label="Size">
            <NumInput
              value={obj.fontSize ?? 24}
              onChange={(v) => onUpdate({ fontSize: Math.max(8, v) })}
              min={8}
              max={200}
            />
          </PropRow>
        </Section>
      )}

      {/* Appearance */}
      <Section title="Appearance">
        {obj.type !== 'line' && (
          <PropRow label="Fill">
            <ColorInput value={obj.fill} onChange={(v) => onUpdate({ fill: v })} />
          </PropRow>
        )}
        <PropRow label="Stroke">
          <ColorInput value={obj.stroke || '#000000'} onChange={(v) => onUpdate({ stroke: v })} />
        </PropRow>
        {(obj.stroke || obj.strokeWidth > 0) && (
          <PropRow label="S.Width">
            <NumInput
              value={obj.strokeWidth}
              onChange={(v) => onUpdate({ strokeWidth: Math.max(0, v) })}
              min={0}
              max={50}
            />
          </PropRow>
        )}
        <PropRow label="Opacity">
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={obj.opacity}
              onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
              className="flex-1 accent-[#0057FF]"
            />
            <span className="text-[10px] font-mono text-[#888] dark:text-[#666] w-7 text-right">
              {Math.round(obj.opacity * 100)}%
            </span>
          </div>
        </PropRow>
      </Section>

      {/* Object ID */}
      <div className="px-3.5 py-2.5 mt-auto">
        <div className="text-[9px] text-[#CCC] dark:text-[#444] font-mono">ID: {obj.id}</div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3.5 py-2.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E] text-[11px] font-semibold text-[#0A0A0A] dark:text-[#F0F0F0] tracking-tight flex-shrink-0">
        Properties
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center">
          <div className="w-5 h-5 rounded border-2 border-[#D0D0D0] dark:border-[#3A3A3A]" />
        </div>
        <p className="text-[11px] text-[#CCC] dark:text-[#555] leading-relaxed">
          Select an object<br />to edit its properties
        </p>
      </div>
    </div>
  )
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function PropertiesPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(true)
  const { objects, selectedId, setSelected, updateObject, removeObject } = useCanvasStore()
  const obj = objects.find((o) => o.id === selectedId) as CanvasObject | undefined

  const handleDelete = () => {
    if (!obj) return
    removeObject(obj.id)
    setSelected(null)
  }

  const handleUpdate = (updates: Partial<CanvasObject>) => {
    if (obj) updateObject(obj.id, updates)
  }

  return (
    <>
      {/* ── Desktop: collapsible right panel ── */}
      <div
        className={[
          'hidden md:flex absolute top-2 right-2 bottom-2 z-20 flex-col',
          'bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A]',
          'rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20',
          'transition-all duration-200 ease-out overflow-hidden',
          collapsed ? 'w-8' : 'w-[220px]',
        ].join(' ')}
      >
        {/* Collapse toggle — sits on the left edge */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
          className={[
            'absolute top-1/2 -translate-y-1/2 z-10',
            'w-5 h-5 flex items-center justify-center',
            'bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A]',
            'rounded-full text-[#888] dark:text-[#666] hover:text-[#555] dark:hover:text-[#999]',
            'transition-all duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]',
            collapsed ? 'left-1.5' : '-left-2.5',
          ].join(' ')}
        >
          {collapsed ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
        </button>

        {/* Panel content */}
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            {obj ? (
              <PanelContent obj={obj} onUpdate={handleUpdate} onDelete={handleDelete} />
            ) : (
              <EmptyState />
            )}
          </div>
        )}
      </div>

      {/* ── Mobile: bottom drawer (shown when object selected) ── */}
      {selectedId && obj && (
        <div
          className={[
            'md:hidden absolute bottom-20 left-2 right-2 z-30',
            'bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A]',
            'rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30',
            'transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-y-0' : 'translate-y-[calc(100%+5rem)]',
          ].join(' ')}
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          {/* Drawer handle */}
          <div
            className="flex items-center justify-center py-2 cursor-pointer"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <GripHorizontal size={16} className="text-[#CCC] dark:text-[#444]" />
          </div>

          {/* Content — max height with scroll */}
          <div className="max-h-[45vh] overflow-y-auto pb-4">
            <PanelContent obj={obj} onUpdate={handleUpdate} onDelete={handleDelete} />
          </div>
        </div>
      )}
    </>
  )
}
