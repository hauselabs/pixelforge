'use client'

import { Trash2 } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { CanvasObject } from '@/lib/types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderBottom: '1px solid #F0F0F0',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#AAAAAA',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function PropRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 7,
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: '#888',
          width: 60,
          flexShrink: 0,
          fontWeight: 400,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1 }}>{children}</div>
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
      style={{
        width: '100%',
        padding: '4px 8px',
        border: '1px solid #E8E8E8',
        borderRadius: 5,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#0A0A0A',
        background: '#FAFAFA',
        outline: 'none',
      }}
    />
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isGradient = value?.startsWith('linear-gradient') || value?.startsWith('radial-gradient')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {isGradient ? (
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            background: value,
            border: '1px solid rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}
        />
      ) : (
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 22,
            height: 22,
            border: '1px solid #E0E0E0',
            borderRadius: 4,
            padding: 1,
            cursor: 'pointer',
            background: 'none',
          }}
        />
      )}
      <input
        type="text"
        value={isGradient ? '(gradient)' : value}
        onChange={(e) => !isGradient && onChange(e.target.value)}
        readOnly={isGradient}
        style={{
          flex: 1,
          padding: '4px 7px',
          border: '1px solid #E8E8E8',
          borderRadius: 5,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#0A0A0A',
          background: '#FAFAFA',
          outline: 'none',
        }}
      />
    </div>
  )
}

export function PropertiesPanel() {
  const { objects, selectedId, setSelected, updateObject, removeObject } = useCanvasStore()
  const obj = objects.find((o) => o.id === selectedId) as CanvasObject | undefined

  const update = (updates: Partial<CanvasObject>) => {
    if (obj) updateObject(obj.id, updates)
  }

  if (!obj) {
    return (
      <aside
        style={{
          width: 220,
          background: '#FFFFFF',
          borderLeft: '1px solid #EBEBEB',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '14px',
            borderBottom: '1px solid #F0F0F0',
            fontSize: 11,
            fontWeight: 600,
            color: '#0A0A0A',
            letterSpacing: '-0.01em',
          }}
        >
          Properties
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#CCCCCC',
            fontSize: 11,
            textAlign: 'center',
            padding: 20,
          }}
        >
          Select an object to edit its properties
        </div>
      </aside>
    )
  }

  return (
    <aside
      style={{
        width: 220,
        background: '#FFFFFF',
        borderLeft: '1px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.01em' }}>
            {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
          </div>
          <div
            style={{
              fontSize: 9,
              color: '#BBB',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 1,
            }}
          >
            {obj.id.slice(0, 8)}…
          </div>
        </div>
        <button
          onClick={() => {
            removeObject(obj.id)
            setSelected(null)
          }}
          title="Delete object"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            borderRadius: 6,
            cursor: 'pointer',
            color: '#FF4545',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#FFF0F0'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Position */}
      <Section title="Position">
        <PropRow label="X">
          <NumInput value={obj.x} onChange={(v) => update({ x: v })} />
        </PropRow>
        <PropRow label="Y">
          <NumInput value={obj.y} onChange={(v) => update({ y: v })} />
        </PropRow>
        <PropRow label="Rotate">
          <NumInput value={obj.rotation} onChange={(v) => update({ rotation: v })} min={-360} max={360} />
        </PropRow>
      </Section>

      {/* Size */}
      {(obj.type === 'rect' || obj.type === 'line') && (
        <Section title="Size">
          <PropRow label="Width">
            <NumInput value={obj.width ?? 0} onChange={(v) => update({ width: Math.max(1, v) })} min={1} />
          </PropRow>
          {obj.type === 'rect' && (
            <PropRow label="Height">
              <NumInput value={obj.height ?? 0} onChange={(v) => update({ height: Math.max(1, v) })} min={1} />
            </PropRow>
          )}
        </Section>
      )}

      {obj.type === 'circle' && (
        <Section title="Size">
          <PropRow label="Radius">
            <NumInput value={obj.radius ?? 50} onChange={(v) => update({ radius: Math.max(1, v) })} min={1} />
          </PropRow>
        </Section>
      )}

      {obj.type === 'text' && (
        <Section title="Text">
          <div style={{ marginBottom: 7 }}>
            <textarea
              value={obj.text ?? ''}
              onChange={(e) => update({ text: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #E8E8E8',
                borderRadius: 5,
                fontSize: 12,
                color: '#0A0A0A',
                background: '#FAFAFA',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <PropRow label="Size">
            <NumInput
              value={obj.fontSize ?? 24}
              onChange={(v) => update({ fontSize: Math.max(8, v) })}
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
            <ColorInput value={obj.fill} onChange={(v) => update({ fill: v })} />
          </PropRow>
        )}
        <PropRow label="Stroke">
          <ColorInput value={obj.stroke || '#000000'} onChange={(v) => update({ stroke: v })} />
        </PropRow>
        {(obj.stroke || obj.strokeWidth > 0) && (
          <PropRow label="S.Width">
            <NumInput
              value={obj.strokeWidth}
              onChange={(v) => update({ strokeWidth: Math.max(0, v) })}
              min={0}
              max={50}
            />
          </PropRow>
        )}
        <PropRow label="Opacity">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={obj.opacity}
              onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: '#0057FF' }}
            />
            <span
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#888',
                width: 28,
                textAlign: 'right',
              }}
            >
              {Math.round(obj.opacity * 100)}%
            </span>
          </div>
        </PropRow>
      </Section>

      {/* Object ID */}
      <div
        style={{
          padding: '10px 14px',
          marginTop: 'auto',
        }}
      >
        <div style={{ fontSize: 9, color: '#CCC', fontFamily: "'JetBrains Mono', monospace" }}>
          ID: {obj.id}
        </div>
      </div>
    </aside>
  )
}
