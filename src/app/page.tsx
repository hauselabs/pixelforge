'use client'

import { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type Konva from 'konva'

import { TopBar } from '@/components/TopBar'
import { Toolbar } from '@/components/Toolbar'
import { PropertiesPanel } from '@/components/PropertiesPanel'
import { BottomBar } from '@/components/BottomBar'
import { useCanvasStore } from '@/lib/store'

// Dynamic import for react-konva Canvas — no SSR (Konva requires DOM)
const Canvas = dynamic(
  () => import('@/components/Canvas').then((mod) => mod.Canvas),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#E8E8E8',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #E0E0E0',
            borderTopColor: '#0057FF',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    ),
  }
)

// Collaborate mode wrapper — dynamic to avoid SSR issues with SurfProvider
const CollaborateWrapper = dynamic(
  () => import('@/components/CollaborateWrapper').then((mod) => mod.CollaborateWrapper),
  { ssr: false }
)

export default function PixelForgePage() {
  const stageRef = useRef<Konva.Stage | null>(null)
  const { mode, stageScale, setStageScale, setStagePos, stagePos, connectionStatus } = useCanvasStore()

  const handleExport = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    // Temporarily hide transformer for export
    const transformer = stage.findOne('Transformer')
    if (transformer) transformer.hide()
    stage.batchDraw()

    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2,
    })

    if (transformer) transformer.show()
    stage.batchDraw()

    const link = document.createElement('a')
    link.href = dataURL
    link.download = `pixelforge-${Date.now()}.png`
    link.click()
  }, [])

  const handleZoomIn = useCallback(() => {
    setStageScale(Math.min(20, stageScale * 1.2))
  }, [stageScale, setStageScale])

  const handleZoomOut = useCallback(() => {
    setStageScale(Math.max(0.1, stageScale / 1.2))
  }, [stageScale, setStageScale])

  const handleResetZoom = useCallback(() => {
    setStageScale(1)
    setStagePos({ x: 0, y: 0 })
  }, [setStageScale, setStagePos])

  const canvasEl = <Canvas stageRef={stageRef} />

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#FAFAFA',
      }}
    >
      <TopBar onExport={handleExport} connectionStatus={connectionStatus} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <Toolbar />

        {/* Main canvas area */}
        {mode === 'collaborate' ? (
          <CollaborateWrapper>{canvasEl}</CollaborateWrapper>
        ) : (
          canvasEl
        )}

        <PropertiesPanel />
      </div>

      <BottomBar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
