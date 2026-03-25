'use client'

import { Undo2, Redo2, Download, Layers, Zap } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { Mode } from '@/lib/types'

interface TopBarProps {
  onExport: () => void
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
}

export function TopBar({ onExport, connectionStatus = 'disconnected' }: TopBarProps) {
  const { mode, setMode, undo, redo, history, historyIndex } = useCanvasStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleModeToggle = (newMode: Mode) => {
    setMode(newMode)
  }

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Live'
      : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
      ? 'Connecting…'
      : 'Offline'

  const statusColor =
    connectionStatus === 'connected'
      ? '#00C9B1'
      : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
      ? '#F59E0B'
      : '#D1D5DB'

  return (
    <header
      style={{
        height: 48,
        background: '#FFFFFF',
        borderBottom: '1px solid #EBEBEB',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        gap: 0,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginRight: 24,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            background: 'linear-gradient(135deg, #0057FF, #00C9B1)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Layers size={14} color="white" />
        </div>
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '-0.01em',
            color: '#0A0A0A',
          }}
        >
          PixelForge
        </span>
      </div>

      {/* Undo / Redo */}
      <div style={{ display: 'flex', gap: 2, marginRight: 12 }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            borderRadius: 6,
            cursor: canUndo ? 'pointer' : 'not-allowed',
            color: canUndo ? '#555' : '#CCC',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => {
            if (canUndo) (e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
          }}
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            borderRadius: 6,
            cursor: canRedo ? 'pointer' : 'not-allowed',
            color: canRedo ? '#555' : '#CCC',
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => {
            if (canRedo) (e.currentTarget as HTMLButtonElement).style.background = '#F0F0F0'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
          }}
        >
          <Redo2 size={15} />
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Mode Toggle */}
      <div
        style={{
          display: 'flex',
          background: '#F2F2F2',
          borderRadius: 8,
          padding: 3,
          gap: 2,
          marginRight: 12,
        }}
      >
        {(['local', 'collaborate'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeToggle(m)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              border: 'none',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: mode === m ? '#FFFFFF' : 'transparent',
              color: mode === m ? '#0A0A0A' : '#888',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {m === 'collaborate' && (
              <Zap
                size={11}
                color={mode === 'collaborate' ? '#0057FF' : '#AAA'}
                fill={mode === 'collaborate' ? '#0057FF' : 'none'}
              />
            )}
            {m === 'local' ? 'Local' : 'Collaborate'}
          </button>
        ))}
      </div>

      {/* Collaborate status indicator */}
      {mode === 'collaborate' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginRight: 12,
            padding: '4px 10px',
            background: connectionStatus === 'connected' ? 'rgba(0,201,177,0.08)' : '#F8F8F8',
            borderRadius: 20,
            border: `1px solid ${connectionStatus === 'connected' ? 'rgba(0,201,177,0.2)' : '#EBEBEB'}`,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColor,
              display: 'inline-block',
              animation: connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'pulse 1s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 500, color: '#555' }}>{statusLabel}</span>
        </div>
      )}

      {/* Export */}
      <button
        onClick={onExport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          background: '#0057FF',
          color: 'white',
          border: 'none',
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = '#0046D4'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = '#0057FF'
        }}
      >
        <Download size={13} />
        Export PNG
      </button>
    </header>
  )
}
