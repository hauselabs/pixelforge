'use client'

import { useEffect, useState } from 'react'
import { Undo2, Redo2, Download, Layers, Zap, Sun, Moon } from 'lucide-react'
import { useCanvasStore } from '@/lib/store'
import type { Mode } from '@/lib/types'

interface TopBarProps {
  onExport: () => void
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
}

export function TopBar({ onExport, connectionStatus = 'disconnected' }: TopBarProps) {
  const { mode, setMode, undo, redo, history, historyIndex, setTheme } = useCanvasStore()
  const [isDark, setIsDark] = useState(false)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Track dark mode state reactively
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    // Sync store theme from localStorage
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
    <header className="h-10 bg-white dark:bg-[#141414] border-b border-[#E5E5E5] dark:border-[#2A2A2A] flex items-center px-3 gap-0 select-none flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 bg-gradient-to-br from-[#0057FF] to-[#00C9B1] rounded-md flex items-center justify-center flex-shrink-0">
          <Layers size={13} color="white" />
        </div>
        <span className="font-semibold text-[13px] tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0] hidden sm:block">
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
              ? 'text-[#555] dark:text-[#999] hover:bg-[#F0F0F0] dark:hover:bg-[#1E1E1E] cursor-pointer'
              : 'text-[#CCC] dark:text-[#444] cursor-not-allowed',
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
              ? 'text-[#555] dark:text-[#999] hover:bg-[#F0F0F0] dark:hover:bg-[#1E1E1E] cursor-pointer'
              : 'text-[#CCC] dark:text-[#444] cursor-not-allowed',
          ].join(' ')}
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mode Toggle — hidden on mobile */}
      <div className="hidden sm:flex bg-[#F2F2F2] dark:bg-[#1A1A1A] rounded-lg p-0.5 gap-0.5 mr-2">
        {(['local', 'collaborate'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={[
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150',
              'flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]',
              mode === m
                ? 'bg-white dark:bg-[#2A2A2A] text-[#0A0A0A] dark:text-[#F0F0F0] shadow-sm'
                : 'text-[#888] dark:text-[#555] hover:text-[#555] dark:hover:text-[#999] bg-transparent',
            ].join(' ')}
          >
            {m === 'collaborate' && (
              <Zap
                size={10}
                className={
                  mode === 'collaborate'
                    ? 'text-[#0057FF] fill-[#0057FF]'
                    : 'text-[#AAA] dark:text-[#555]'
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
            'hidden sm:flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-full text-[11px] font-medium',
            connectionStatus === 'connected'
              ? 'bg-[rgba(0,201,177,0.08)] border border-[rgba(0,201,177,0.2)] text-[#555] dark:text-[#999]'
              : 'bg-[#F8F8F8] dark:bg-[#1A1A1A] border border-[#EBEBEB] dark:border-[#2A2A2A] text-[#555] dark:text-[#999]',
          ].join(' ')}
        >
          <span
            className={[
              'w-1.5 h-1.5 rounded-full inline-block',
              connectionStatus === 'connected' ? 'bg-[#00C9B1]' : '',
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
                ? 'bg-amber-400 animate-pulse'
                : '',
              connectionStatus === 'disconnected' ? 'bg-[#D1D5DB]' : '',
            ].join(' ')}
          />
          {statusLabel}
        </div>
      )}

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 text-[#555] dark:text-[#999] hover:bg-[#F0F0F0] dark:hover:bg-[#1E1E1E] mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]"
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0057FF] hover:bg-[#0046D4] active:bg-[#0038B0] text-white rounded-md text-[11px] font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF] focus-visible:ring-offset-1"
      >
        <Download size={12} />
        <span className="hidden sm:inline">Export</span>
      </button>
    </header>
  )
}
