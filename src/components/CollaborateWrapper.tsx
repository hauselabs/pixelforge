'use client'

import { useEffect, useState } from 'react'
import { SurfProvider, useSurf, useSurfState } from '@surfjs/react'
import { useCanvasStore } from '@/lib/store'
import type { CanvasObject } from '@/lib/types'

interface CanvasStateFromServer {
  objects: CanvasObject[]
}

function SyncLayer({ children }: { children: React.ReactNode }) {
  const { execute, status, connected } = useSurf()
  const { setObjects, setConnectionStatus } = useCanvasStore()

  const [serverState] = useSurfState<CanvasStateFromServer>('canvas', { objects: [] })

  useEffect(() => {
    setConnectionStatus(status)
  }, [status, setConnectionStatus])

  useEffect(() => {
    if (serverState?.objects) {
      setObjects(serverState.objects)
    }
  }, [serverState, setObjects])

  useEffect(() => {
    async function fetchInitialState() {
      try {
        const result = await execute('canvas.getState')
        if (result.ok && result.result) {
          const data = result.result as CanvasStateFromServer
          if (data.objects) {
            setObjects(data.objects)
          }
        }
      } catch {
        // ignore
      }
    }
    if (connected) {
      fetchInitialState()
    }
  }, [connected, execute, setObjects])

  return <>{children}</>
}

function WsUnavailableBanner() {
  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 shadow-lg backdrop-blur-sm max-w-md text-center">
      <p className="text-[12px] font-medium text-amber-800 dark:text-amber-200">
        Collaborate mode requires WebSocket support
      </p>
      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
        This Vercel deployment doesn&apos;t support persistent connections. Run locally or deploy to a WS-capable host (Railway, Fly.io) for real-time collaboration.
      </p>
    </div>
  )
}

export function CollaborateWrapper({ children }: { children: React.ReactNode }) {
  const [wsAvailable, setWsAvailable] = useState<boolean | null>(null)

  // Test WebSocket connectivity once on mount
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/api/surf`
    
    let timeout: ReturnType<typeof setTimeout>
    try {
      const ws = new WebSocket(url)
      timeout = setTimeout(() => {
        ws.close()
        setWsAvailable(false)
      }, 3000)

      ws.onopen = () => {
        clearTimeout(timeout)
        ws.close()
        setWsAvailable(true)
      }
      ws.onerror = () => {
        clearTimeout(timeout)
        setWsAvailable(false)
      }
    } catch {
      setWsAvailable(false)
    }

    return () => clearTimeout(timeout)
  }, [])

  // Still testing
  if (wsAvailable === null) {
    return (
      <>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-lg backdrop-blur-sm">
          <p className="text-[12px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Connecting to collaborate server…
          </p>
        </div>
        {children}
      </>
    )
  }

  // WS not available — show banner but still render canvas
  if (!wsAvailable) {
    return (
      <>
        <WsUnavailableBanner />
        {children}
      </>
    )
  }

  // WS available — full Surf Live
  const surfUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/surf`

  return (
    <SurfProvider url={surfUrl} channels={['canvas']}>
      <SyncLayer>{children}</SyncLayer>
    </SurfProvider>
  )
}
