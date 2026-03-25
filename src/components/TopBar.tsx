'use client'

import { useEffect, useState } from 'react'
import { Undo2, Redo2, Download, Zap, Sun, Moon } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { Mode } from '@/lib/types'

interface TopBarProps {
  onExport: () => void
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
}

/** PixelForge branded logo mark */
function PFLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pf-grad" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0057FF" />
          <stop offset="1" stopColor="#00C9B1" />
        </linearGradient>
      </defs>
      <rect width="22" height="22" rx="6" fill="url(#pf-grad)" />
      {/* P glyph */}
      <rect x="6" y="5" width="2" height="12" rx="1" fill="white" fillOpacity="0.95" />
      <rect x="6" y="5" width="6" height="2" rx="1" fill="white" fillOpacity="0.95" />
      <rect x="6" y="10" width="6" height="2" rx="1" fill="white" fillOpacity="0.95" />
      <rect x="12" y="5" width="2" height="7" rx="1" fill="white" fillOpacity="0.95" />
      {/* F accent */}
      <rect x="15" y="13" width="2" height="4" rx="0.5" fill="white" fillOpacity="0.5" />
    </svg>
  )
}

export function TopBar({ onExport, connectionStatus = 'disconnected' }: TopBarProps) {
  const { mode, setMode, undo, redo, history, historyIndex, setTheme } = useCanvasStore()
  const [isDark, setIsDark] = useState(false)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    try {
      const stored = localStorage.getItem('pf-theme') as 'light' | 'dark' | null
      if (stored === 'dark') setTheme('dark')
      else if (stored === 'light') setTheme('light')
      else setTheme('system')
    } catch {}
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [setTheme])

  const toggleDarkMode = () => {
    const html = document.documentElement
    const nowDark = html.classList.contains('dark')
    if (nowDark) {
      html.classList.remove('dark')
      setTheme('light')
      try { localStorage.setItem('pf-theme', 'light') } catch {}
    } else {
      html.classList.add('dark')
      setTheme('dark')
      try { localStorage.setItem('pf-theme', 'dark') } catch {}
    }
  }

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Live'
      : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
      ? 'Connecting…'
      : 'Offline'

  return (
    <header
      className="h-11 flex items-center px-3 gap-0 select-none flex-shrink-0 relative"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #18181b 0%, #111113 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #fafaf8 100%)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.07)',
        boxShadow: isDark
          ? '0 1px 0 rgba(255,255,255,0.03)'
          : '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <PFLogo />
        <span
          className="font-semibold text-[13px] text-[#0A0A0A] dark:text-[#F0F0F0] hidden sm:block"
          style={{ letterSpacing: '-0.02em' }}
        >
          PixelForge
        </span>
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-0.5 mr-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={[
            'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]',
            canUndo
              ? 'text-[#555] dark:text-[#888] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] cursor-pointer'
              : 'text-[#CCC] dark:text-[#3a3a3a] cursor-not-allowed',
          ].join(' ')}
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className={[
            'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]',
            canRedo
              ? 'text-[#555] dark:text-[#888] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] cursor-pointer'
              : 'text-[#CCC] dark:text-[#3a3a3a] cursor-not-allowed',
          ].join(' ')}
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mode Toggle — segmented control with sliding indicator */}
      <div
        className="hidden sm:flex items-center relative mr-3"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          borderRadius: '8px',
          padding: '2px',
        }}
      >
        {/* Sliding indicator */}
        <div
          className="absolute top-[2px] bottom-[2px] rounded-[6px] transition-all duration-200 ease-out"
          style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff',
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
            left: mode === 'local' ? '2px' : '50%',
            width: 'calc(50% - 2px)',
          }}
        />
        {(['local', 'collaborate'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={[
              'relative z-10 px-3 py-1 rounded-[6px] text-[11px] font-medium transition-all duration-150',
              'flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]',
              mode === m
                ? 'text-[#0A0A0A] dark:text-[#F0F0F0]'
                : 'text-[#999] dark:text-[#555] hover:text-[#666] dark:hover:text-[#888]',
            ].join(' ')}
          >
            {m === 'collaborate' && (
              <Zap
                size={10}
                className={
                  mode === 'collaborate'
                    ? 'text-[#0057FF] fill-[#0057FF]'
                    : 'text-[#BBB] dark:text-[#444]'
                }
              />
            )}
            {m === 'local' ? 'Local' : 'Collaborate'}
          </button>
        ))}
      </div>

      {/* Collaborate status indicator */}
      {mode === 'collaborate' && (
        <div
          className={[
            'hidden sm:flex items-center gap-1.5 mr-3 px-2.5 py-1 rounded-full text-[11px] font-medium',
            connectionStatus === 'connected'
              ? 'bg-[rgba(0,201,177,0.08)] border border-[rgba(0,201,177,0.18)] text-[#555] dark:text-[#999]'
              : 'text-[#888] dark:text-[#666]',
          ].join(' ')}
          style={{
            border: connectionStatus !== 'connected'
              ? isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
              : undefined,
            background: connectionStatus !== 'connected'
              ? isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
              : undefined,
          }}
        >
          <span
            className={[
              'w-1.5 h-1.5 rounded-full inline-block',
              connectionStatus === 'connected' ? 'bg-[#00C9B1]' : '',
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
                ? 'bg-amber-400 animate-pulse'
                : '',
              connectionStatus === 'disconnected' ? 'bg-[#D1D5DB] dark:bg-[#3a3a3a]' : '',
            ].join(' ')}
          />
          {statusLabel}
        </div>
      )}

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 text-[#666] dark:text-[#888] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]"
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Export — subtle, not loud */}
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF] focus-visible:ring-offset-1"
        style={{
          background: isDark
            ? 'rgba(0,87,255,0.15)'
            : '#0057FF',
          color: isDark ? '#6699ff' : '#ffffff',
          border: isDark ? '1px solid rgba(0,87,255,0.25)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isDark) (e.currentTarget as HTMLButtonElement).style.background = '#0046D4'
        }}
        onMouseLeave={(e) => {
          if (!isDark) (e.currentTarget as HTMLButtonElement).style.background = '#0057FF'
        }}
      >
        <Download size={12} />
        <span className="hidden sm:inline">Export</span>
      </button>
    </header>
  )
}
