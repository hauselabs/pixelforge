'use client'

import { useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type Konva from 'konva'

import { TopBar } from '@/components/TopBar'
import { Toolbar } from '@/components/Toolbar'
import { PropertiesPanel } from '@/components/PropertiesPanel'
import { useCanvasStore } from '@/lib/store'

// Dynamic import for react-konva Canvas — no SSR (Konva requires DOM)
const Canvas = dynamic(
  () => import('@/components/Canvas').then((mod) => mod.Canvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#FAFAFA] dark:bg-[#1a1a1a]">
        <div
          className="w-8 h-8 rounded-full border-2 border-[#E0E0E0] dark:border-[#2A2A2A] border-t-[#0057FF]"
          style={{ animation: 'spin 0.7s linear infinite' }}
        />
      </div>
    ),
  }
)

// Collaborate mode wrapper — dynamic to avoid SSR issues with SurfProvider
const CollaborateWrapper = dynamic(
  () =>
    import('@/components/CollaborateWrapper').then((mod) => mod.CollaborateWrapper),
  { ssr: false }
)

export default function PixelForgePage() {
  const stageRef = useRef<Konva.Stage | null>(null)
  const { mode, stageScale, setStageScale, setStagePos, connectionStatus, objects } =
    useCanvasStore()

  const handleExport = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    // Hide transformer for clean export
    const transformer = stage.findOne('Transformer')
    if (transformer) transformer.hide()
    stage.batchDraw()

    // Export with explicit white background
    const stageCanvas = stage.toCanvas({ pixelRatio: 2 })
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = stageCanvas.width
    exportCanvas.height = stageCanvas.height
    const ctx = exportCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
      ctx.drawImage(stageCanvas, 0, 0)
    }

    if (transformer) transformer.show()
    stage.batchDraw()

    const dataURL = ctx
      ? exportCanvas.toDataURL('image/png')
      : stage.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 })

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

  const canvasEl = <Canvas stageRef={stageRef} isEmpty={objects.length === 0} />

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <TopBar onExport={handleExport} connectionStatus={connectionStatus} />

      {/* Canvas area — full width, floating UI elements overlaid */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas fills entire area */}
        <div className="absolute inset-0">
          {mode === 'collaborate' ? (
            <CollaborateWrapper>{canvasEl}</CollaborateWrapper>
          ) : (
            canvasEl
          )}
        </div>

        {/* Floating toolbar (left on desktop, bottom on mobile) */}
        <Toolbar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />

        {/* Floating properties panel (right side, collapsible) */}
        <PropertiesPanel />
      </div>
    </div>
  )
}
