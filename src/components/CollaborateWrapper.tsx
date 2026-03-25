'use client'

import { useEffect } from 'react'
import { SurfProvider, useSurf, useSurfState } from '@surfjs/react'
import { useCanvasStore } from '@/lib/store'
import type { CanvasObject } from '@/lib/types'

interface CanvasStateFromServer {
  objects: CanvasObject[]
}

function SyncLayer({ children }: { children: React.ReactNode }) {
  const { execute, status, connected } = useSurf()
  const { setObjects, setConnectionStatus } = useCanvasStore()

  // Sync live state from server
  const [serverState] = useSurfState<CanvasStateFromServer>('canvas', { objects: [] })

  // Sync connection status to store
  useEffect(() => {
    setConnectionStatus(status)
  }, [status, setConnectionStatus])

  // When server state changes, update local Zustand store
  useEffect(() => {
    if (serverState?.objects) {
      setObjects(serverState.objects)
    }
  }, [serverState, setObjects])

  // On mount in collaborate mode: fetch current state
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

  return (
    <>
      {children}
    </>
  )
}

export function CollaborateWrapper({ children }: { children: React.ReactNode }) {
  // Determine the Surf WebSocket URL
  const surfUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/surf`
      : '/api/surf'

  return (
    <SurfProvider url={surfUrl} channels={['canvas']}>
      <SyncLayer>{children}</SyncLayer>
    </SurfProvider>
  )
}
