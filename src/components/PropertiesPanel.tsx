'use client'

import { useState, useEffect } from 'react'
import { Trash2, ChevronRight, ChevronLeft, GripHorizontal } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { CanvasObject } from '@/lib/types'
import { FRAME_PRESETS } from '@/lib/types'

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

function getPanelStyle(isDark: boolean): React.CSSProperties {
  return isDark
    ? {
        background: 'rgba(18, 18, 22, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      }
    : {
        background: 'rgba(252, 252, 250, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
      }
}

/* ── Section ── */
function Section({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className="px-4 py-3.5"
      style={{
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="text-[9px] font-semibold tracking-[0.1em] uppercase mb-3"
        style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

/* ── PropRow ── */
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center mb-2 gap-2">
      <span
        className="text-[11px] w-[52px] flex-shrink-0 font-normal"
        style={{ color: 'rgba(128,128,128,0.9)', letterSpacing: '-0.01em' }}
      >
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

/* ── NumInput ── */
function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  isDark,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  isDark: boolean
}) {
  return (
    <input
      type="number"
      value={Math.round(value * 100) / 100}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full rounded-lg text-[11px] outline-none transition-all duration-150"
      style={{
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        padding: '5px 8px',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
        color: isDark ? 'rgba(255,255,255,0.85)' : '#0a0a0a',
      }}
      onFocus={(e) => {
        ;(e.currentTarget as HTMLInputElement).style.borderColor = '#2563EB'
        ;(e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'
      }}
      onBlur={(e) => {
        ;(e.currentTarget as HTMLInputElement).style.borderColor = isDark
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0.07)'
        ;(e.currentTarget as HTMLInputElement).style.boxShadow = 'none'
      }}
    />
  )
}

/* ── ColorInput with swatch ── */
function ColorInput({
  value,
  onChange,
  isDark,
}: {
  value: string
  onChange: (v: string) => void
  isDark: boolean
}) {
  const isGradient = value?.startsWith('linear-gradient') || value?.startsWith('radial-gradient')
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-lg flex-shrink-0 overflow-hidden relative"
        style={{
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {isGradient ? (
          <div className="w-full h-full" style={{ background: value }} />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ background: value || '#000000' }}
            />
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              title="Pick colour"
            />
          </>
        )}
      </div>
      <input
        type="text"
        value={isGradient ? '(gradient)' : value}
        onChange={(e) => !isGradient && onChange(e.target.value)}
        readOnly={isGradient}
        className="flex-1 rounded-lg text-[11px] outline-none transition-all duration-150"
        style={{
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          padding: '5px 8px',
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
          color: isDark ? 'rgba(255,255,255,0.85)' : '#0a0a0a',
        }}
        onFocus={(e) => {
          ;(e.currentTarget as HTMLInputElement).style.borderColor = '#2563EB'
          ;(e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'
        }}
        onBlur={(e) => {
          ;(e.currentTarget as HTMLInputElement).style.borderColor = isDark
            ? 'rgba(255,255,255,0.07)'
            : 'rgba(0,0,0,0.07)'
          ;(e.currentTarget as HTMLInputElement).style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

/* ── Type badge ── */
function TypeBadge({ type, isDark }: { type: string; isDark: boolean }) {
  const colors: Record<string, { bg: string; text: string }> = {
    rect: { bg: isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)', text: '#2563EB' },
    circle: { bg: isDark ? 'rgba(0,201,177,0.12)' : 'rgba(0,201,177,0.08)', text: '#00C9B1' },
    text: { bg: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)', text: '#A855F7' },
    line: { bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', text: isDark ? '#888' : '#666' },
    frame: { bg: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.08)', text: '#D97706' },
  }
  const c = colors[type] ?? colors.rect
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
      style={{ background: c.bg, color: c.text }}
    >
      {type}
    </span>
  )
}

/* ── Panel content ── */
function PanelContent({
  obj,
  onUpdate,
  onDelete,
  isDark,
}: {
  obj: CanvasObject
  onUpdate: (updates: Partial<CanvasObject>) => void
  onDelete: () => void
  isDark: boolean
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        }}
      >
        <div className="flex items-center gap-2">
          <TypeBadge type={obj.type} isDark={isDark} />
          <div
            className="text-[9px]"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
            }}
          >
            {obj.id.slice(0, 8)}
          </div>
        </div>
        <button
          onClick={onDelete}
          title="Delete object"
          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4545]"
          style={{ color: '#FF4545', background: 'transparent' }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = isDark
              ? 'rgba(255,69,69,0.15)'
              : 'rgba(255,69,69,0.08)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Frame name */}
      {obj.type === 'frame' && (
        <Section title="Frame" isDark={isDark}>
          <PropRow label="Name">
            <input
              type="text"
              value={obj.frameName ?? 'Frame'}
              onChange={(e) => onUpdate({ frameName: e.target.value })}
              className="w-full rounded-lg text-[12px] outline-none transition-all duration-150"
              style={{
                fontFamily: 'Inter, sans-serif',
                padding: '5px 8px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                color: isDark ? 'rgba(255,255,255,0.85)' : '#0a0a0a',
              }}
              onFocus={(e) => {
                ;(e.currentTarget as HTMLInputElement).style.borderColor = '#2563EB'
              }}
              onBlur={(e) => {
                ;(e.currentTarget as HTMLInputElement).style.borderColor = isDark
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(0,0,0,0.07)'
              }}
            />
          </PropRow>
          {/* Presets */}
          <div className="flex gap-1.5 mt-1">
            {FRAME_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() =>
                  onUpdate({
                    width: p.width,
                    height: p.height,
                    frameName: `${p.name} — ${p.width}×${p.height}`,
                  })
                }
                className="text-[10px] px-2 py-1 rounded-md font-medium transition-all duration-150"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: isDark ? '#888' : '#666',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.07)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)'
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Position */}
      <Section title="Position" isDark={isDark}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-[9px] font-medium mb-1" style={{ color: isDark ? '#555' : '#aaa' }}>X</div>
            <NumInput value={obj.x} onChange={(v) => onUpdate({ x: v })} isDark={isDark} />
          </div>
          <div>
            <div className="text-[9px] font-medium mb-1" style={{ color: isDark ? '#555' : '#aaa' }}>Y</div>
            <NumInput value={obj.y} onChange={(v) => onUpdate({ y: v })} isDark={isDark} />
          </div>
        </div>
        <PropRow label="Rotate">
          <NumInput
            value={obj.rotation}
            onChange={(v) => onUpdate({ rotation: v })}
            min={-360}
            max={360}
            isDark={isDark}
          />
        </PropRow>
      </Section>

      {/* Size */}
      {(obj.type === 'rect' || obj.type === 'line' || obj.type === 'frame') && (
        <Section title="Size" isDark={isDark}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] font-medium mb-1" style={{ color: isDark ? '#555' : '#aaa' }}>W</div>
              <NumInput
                value={obj.width ?? 0}
                onChange={(v) => onUpdate({ width: Math.max(1, v) })}
                min={1}
                isDark={isDark}
              />
            </div>
            {(obj.type === 'rect' || obj.type === 'frame') && (
              <div>
                <div className="text-[9px] font-medium mb-1" style={{ color: isDark ? '#555' : '#aaa' }}>H</div>
                <NumInput
                  value={obj.height ?? 0}
                  onChange={(v) => onUpdate({ height: Math.max(1, v) })}
                  min={1}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {obj.type === 'circle' && (
        <Section title="Size" isDark={isDark}>
          <PropRow label="Radius">
            <NumInput
              value={obj.radius ?? 50}
              onChange={(v) => onUpdate({ radius: Math.max(1, v) })}
              min={1}
              isDark={isDark}
            />
          </PropRow>
        </Section>
      )}

      {obj.type === 'text' && (
        <Section title="Text" isDark={isDark}>
          <div className="mb-2">
            <textarea
              value={obj.text ?? ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={3}
              className="w-full rounded-lg text-[12px] outline-none resize-y transition-all duration-150"
              style={{
                fontFamily: 'Inter, sans-serif',
                padding: '6px 8px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                color: isDark ? 'rgba(255,255,255,0.85)' : '#0a0a0a',
              }}
              onFocus={(e) => {
                ;(e.currentTarget as HTMLTextAreaElement).style.borderColor = '#2563EB'
                ;(e.currentTarget as HTMLTextAreaElement).style.boxShadow =
                  '0 0 0 2px rgba(37,99,235,0.12)'
              }}
              onBlur={(e) => {
                ;(e.currentTarget as HTMLTextAreaElement).style.borderColor = isDark
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(0,0,0,0.07)'
                ;(e.currentTarget as HTMLTextAreaElement).style.boxShadow = 'none'
              }}
            />
          </div>
          <PropRow label="Size">
            <NumInput
              value={obj.fontSize ?? 24}
              onChange={(v) => onUpdate({ fontSize: Math.max(8, v) })}
              min={8}
              max={200}
              isDark={isDark}
            />
          </PropRow>
        </Section>
      )}

      {/* Appearance */}
      <Section title="Appearance" isDark={isDark}>
        {obj.type !== 'line' && obj.type !== 'frame' && (
          <PropRow label="Fill">
            <ColorInput value={obj.fill} onChange={(v) => onUpdate({ fill: v })} isDark={isDark} />
          </PropRow>
        )}
        {obj.type !== 'frame' && (
          <>
            <PropRow label="Stroke">
              <ColorInput
                value={obj.stroke || '#000000'}
                onChange={(v) => onUpdate({ stroke: v })}
                isDark={isDark}
              />
            </PropRow>
            {(obj.stroke || obj.strokeWidth > 0) && (
              <PropRow label="Width">
                <NumInput
                  value={obj.strokeWidth}
                  onChange={(v) => onUpdate({ strokeWidth: Math.max(0, v) })}
                  min={0}
                  max={50}
                  isDark={isDark}
                />
              </PropRow>
            )}
          </>
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
              className="flex-1 accent-[#2563EB]"
            />
            <span
              className="text-[10px] w-8 text-right flex-shrink-0"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
              }}
            >
              {Math.round(obj.opacity * 100)}%
            </span>
          </div>
        </PropRow>
      </Section>

      {/* Object ID footer */}
      <div className="px-4 py-3 mt-auto">
        <div
          className="text-[9px]"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
          }}
        >
          {obj.id}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-3 text-[12px] font-semibold flex-shrink-0"
        style={{
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          color: isDark ? '#f0f0f0' : '#0a0a0a',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          letterSpacing: '-0.01em',
        }}
      >
        Properties
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          }}
        >
          <div
            className="w-5 h-5 rounded"
            style={{
              border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.1)',
            }}
          />
        </div>
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.22)' }}
        >
          Select an object
          <br />
          to edit properties
        </p>
      </div>
    </div>
  )
}

/* ── Main export ── */
export function PropertiesPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(true)
  const isDark = useDark()
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

  const panelStyle = getPanelStyle(isDark)
  const toggleBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(22,22,26,0.95)' : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
    color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  }

  return (
    <>
      {/* ── Desktop: collapsible right panel ── */}
      <div
        className={[
          'hidden md:flex absolute top-2 right-2 bottom-2 z-20 flex-col',
          'rounded-xl overflow-hidden',
          'transition-all duration-200 ease-out',
          collapsed ? 'w-8' : 'w-[224px]',
        ].join(' ')}
        style={panelStyle}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand panel' : 'Collapse panel'}
          className={[
            'absolute top-1/2 -translate-y-1/2 z-10',
            'w-5 h-5 flex items-center justify-center',
            'rounded-full transition-all duration-150 shadow-sm',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]',
            collapsed ? 'left-1.5' : '-left-2.5',
          ].join(' ')}
          style={toggleBtnStyle}
        >
          {collapsed ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
        </button>

        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            {obj ? (
              <PanelContent obj={obj} onUpdate={handleUpdate} onDelete={handleDelete} isDark={isDark} />
            ) : (
              <EmptyState isDark={isDark} />
            )}
          </div>
        )}
      </div>

      {/* ── Mobile: bottom drawer ── */}
      {selectedId && obj && (
        <div
          className={[
            'md:hidden absolute bottom-20 left-2 right-2 z-30',
            'rounded-2xl',
            'transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-y-0' : 'translate-y-[calc(100%+5rem)]',
          ].join(' ')}
          style={{ ...panelStyle, animation: 'slideUp 0.2s ease-out' }}
        >
          <div
            className="flex items-center justify-center py-2 cursor-pointer"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <GripHorizontal
              size={16}
              style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
            />
          </div>
          <div className="max-h-[45vh] overflow-y-auto pb-4">
            <PanelContent obj={obj} onUpdate={handleUpdate} onDelete={handleDelete} isDark={isDark} />
          </div>
        </div>
      )}
    </>
  )
}
