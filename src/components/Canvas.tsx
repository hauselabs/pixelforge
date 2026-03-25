'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect, Circle, Text, Line, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useCanvasStore } from '@/lib/store'
import type { CanvasObject } from '@/lib/types'
import { parseGradient } from '@/lib/types'

const MIN_SCALE = 0.1
const MAX_SCALE = 20
const ZOOM_FACTOR = 1.12

interface ShapeProps {
  obj: CanvasObject
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<CanvasObject>) => void
  onDragEnd: (x: number, y: number) => void
}

function GradientRect({ obj, onSelect, onChange, onDragEnd }: ShapeProps) {
  const gradient = parseGradient(obj.fill)
  const width = obj.width ?? 100
  const height = obj.height ?? 80

  const sharedProps = {
    id: obj.id,
    x: obj.x,
    y: obj.y,
    width,
    height,
    stroke: obj.stroke || undefined,
    strokeWidth: obj.strokeWidth || 0,
    opacity: obj.opacity,
    rotation: obj.rotation,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd(e.target.x(), e.target.y())
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      })
    },
  }

  if (gradient) {
    if (gradient.type === 'linear') {
      return (
        <Rect
          {...sharedProps}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: width, y: height }}
          fillLinearGradientColorStops={[0, gradient.startColor, 1, gradient.endColor]}
        />
      )
    } else {
      return (
        <Rect
          {...sharedProps}
          fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
          fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={Math.max(width, height) / 2}
          fillRadialGradientColorStops={[0, gradient.startColor, 1, gradient.endColor]}
        />
      )
    }
  }

  return <Rect {...sharedProps} fill={obj.fill} />
}

function GradientCircle({ obj, onSelect, onChange, onDragEnd }: ShapeProps) {
  const gradient = parseGradient(obj.fill)
  const radius = obj.radius ?? 50

  const sharedProps = {
    id: obj.id,
    x: obj.x,
    y: obj.y,
    radius,
    stroke: obj.stroke || undefined,
    strokeWidth: obj.strokeWidth || 0,
    opacity: obj.opacity,
    rotation: obj.rotation,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd(e.target.x(), e.target.y())
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const scale = node.scaleX()
      node.scaleX(1)
      node.scaleY(1)
      onChange({
        x: node.x(),
        y: node.y(),
        radius: Math.max(5, radius * scale),
        rotation: node.rotation(),
      })
    },
  }

  if (gradient) {
    if (gradient.type === 'radial') {
      return (
        <Circle
          {...sharedProps}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={radius}
          fillRadialGradientColorStops={[0, gradient.startColor, 1, gradient.endColor]}
        />
      )
    } else {
      return (
        <Circle
          {...sharedProps}
          fillLinearGradientStartPoint={{ x: -radius, y: 0 }}
          fillLinearGradientEndPoint={{ x: radius, y: 0 }}
          fillLinearGradientColorStops={[0, gradient.startColor, 1, gradient.endColor]}
        />
      )
    }
  }

  return <Circle {...sharedProps} fill={obj.fill} />
}

interface CanvasShapeProps {
  obj: CanvasObject
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<CanvasObject>) => void
}

function CanvasShape({ obj, isSelected, onSelect, onChange }: CanvasShapeProps) {
  const shapeRef = useRef<Konva.Shape>(null)

  const handleDragEnd = useCallback(
    (x: number, y: number) => onChange({ x, y }),
    [onChange]
  )

  const commonDragProps = {
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      handleDragEnd(e.target.x(), e.target.y())
    },
  }

  if (obj.type === 'rect') {
    return (
      <GradientRect
        obj={obj}
        isSelected={isSelected}
        onSelect={onSelect}
        onChange={onChange}
        onDragEnd={handleDragEnd}
      />
    )
  }

  if (obj.type === 'circle') {
    return (
      <GradientCircle
        obj={obj}
        isSelected={isSelected}
        onSelect={onSelect}
        onChange={onChange}
        onDragEnd={handleDragEnd}
      />
    )
  }

  if (obj.type === 'text') {
    return (
      <Text
        id={obj.id}
        ref={shapeRef as React.RefObject<Konva.Text>}
        x={obj.x}
        y={obj.y}
        text={obj.text ?? ''}
        fontSize={obj.fontSize ?? 24}
        fill={obj.fill}
        opacity={obj.opacity}
        rotation={obj.rotation}
        fontFamily="Inter, -apple-system, sans-serif"
        {...commonDragProps}
        onTransformEnd={(e) => {
          const node = e.target
          onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(8, (obj.fontSize ?? 24) * node.scaleX()),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
    )
  }

  if (obj.type === 'line') {
    const lineLength = obj.width ?? 100
    return (
      <Line
        id={obj.id}
        ref={shapeRef as React.RefObject<Konva.Line>}
        x={obj.x}
        y={obj.y}
        points={[0, 0, lineLength, 0]}
        stroke={obj.stroke || '#0A0A0A'}
        strokeWidth={obj.strokeWidth || 2}
        opacity={obj.opacity}
        rotation={obj.rotation}
        lineCap="round"
        {...commonDragProps}
        onTransformEnd={(e) => {
          const node = e.target
          onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: lineLength * node.scaleX(),
          })
          node.scaleX(1)
          node.scaleY(1)
        }}
      />
    )
  }

  return null
}

function SelectionTransformer({ selectedId }: { selectedId: string | null }) {
  const transformerRef = useRef<Konva.Transformer>(null)
  const { objects, updateObject } = useCanvasStore()

  useEffect(() => {
    if (!transformerRef.current) return
    const layer = transformerRef.current.getLayer()
    if (!layer) return

    if (!selectedId) {
      transformerRef.current.nodes([])
      layer.batchDraw()
      return
    }

    const stage = transformerRef.current.getStage()
    if (!stage) return

    const node = stage.findOne(`#${selectedId}`)
    if (node) {
      transformerRef.current.nodes([node])
      layer.batchDraw()
    }
  }, [selectedId, objects])

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox
        return newBox
      }}
      borderStroke="#0057FF"
      borderStrokeWidth={1.5}
      anchorFill="#FFFFFF"
      anchorStroke="#0057FF"
      anchorStrokeWidth={1.5}
      anchorSize={8}
      anchorCornerRadius={2}
      rotateAnchorOffset={20}
      padding={4}
    />
  )
}

interface DrawingPreview {
  type: 'rect' | 'circle' | 'text' | 'line'
  x: number
  y: number
  width: number
  height: number
}

function PreviewShape({ preview }: { preview: DrawingPreview | null }) {
  if (!preview) return null

  const style = {
    fill: 'rgba(0, 87, 255, 0.08)',
    stroke: '#0057FF',
    strokeWidth: 1.5,
    dash: [4, 4],
  }

  if (preview.type === 'rect') {
    return (
      <Rect
        x={Math.min(preview.x, preview.x + preview.width)}
        y={Math.min(preview.y, preview.y + preview.height)}
        width={Math.abs(preview.width)}
        height={Math.abs(preview.height)}
        {...style}
        listening={false}
      />
    )
  }

  if (preview.type === 'circle') {
    const radius = Math.max(Math.abs(preview.width), Math.abs(preview.height)) / 2
    return (
      <Circle
        x={preview.x + preview.width / 2}
        y={preview.y + preview.height / 2}
        radius={radius}
        {...style}
        listening={false}
      />
    )
  }

  if (preview.type === 'line') {
    return (
      <Line
        x={preview.x}
        y={preview.y}
        points={[0, 0, preview.width, preview.height]}
        stroke="#0057FF"
        strokeWidth={1.5}
        dash={[4, 4]}
        listening={false}
      />
    )
  }

  return null
}

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>
}

export function Canvas({ stageRef }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [drawPreview, setDrawPreview] = useState<DrawingPreview | null>(null)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const {
    objects,
    selectedId,
    tool,
    stageScale,
    stagePos,
    setSelected,
    addObject,
    updateObject,
    removeObject,
    setStageScale,
    setStagePos,
    pushHistory,
  } = useCanvasStore()

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          removeObject(selectedId)
          setSelected(null)
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          useCanvasStore.getState().redo()
        } else {
          useCanvasStore.getState().undo()
        }
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const toolMap: Record<string, string> = {
          v: 'select',
          r: 'rect',
          o: 'circle',
          t: 'text',
          l: 'line',
        }
        if (toolMap[e.key.toLowerCase()]) {
          useCanvasStore
            .getState()
            .setTool(toolMap[e.key.toLowerCase()] as 'select' | 'rect' | 'circle' | 'text' | 'line')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, removeObject, setSelected])

  const getStagePointerPosition = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const pos = stage.getPointerPosition()
    if (!pos) return { x: 0, y: 0 }
    return {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    }
  }, [stageRef, stagePos, stageScale])

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return

      const oldScale = stageScale
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const scaleBy = ZOOM_FACTOR
      const newScale =
        e.evt.deltaY < 0
          ? Math.min(MAX_SCALE, oldScale * scaleBy)
          : Math.max(MIN_SCALE, oldScale / scaleBy)

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / oldScale,
        y: (pointer.y - stagePos.y) / oldScale,
      }

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      }

      setStageScale(newScale)
      setStagePos(newPos)
    },
    [stageRef, stageScale, stagePos, setStageScale, setStagePos]
  )

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1) {
        e.evt.preventDefault()
        isPanning.current = true
        const stage = stageRef.current
        const pointer = stage?.getPointerPosition()
        if (pointer) lastPointer.current = pointer
        return
      }

      if (e.evt.button === 2) {
        setSelected(null)
        return
      }

      if (tool === 'select') {
        if (e.target === e.target.getStage()) {
          setSelected(null)
        }
        return
      }

      const pos = getStagePointerPosition()
      setDrawStart(pos)
      setIsDrawing(true)
      setDrawPreview({
        type: tool as DrawingPreview['type'],
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      })
    },
    [tool, setSelected, getStagePointerPosition, stageRef]
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning.current) {
        const stage = stageRef.current
        const pointer = stage?.getPointerPosition()
        if (pointer) {
          const dx = pointer.x - lastPointer.current.x
          const dy = pointer.y - lastPointer.current.y
          setStagePos({ x: stagePos.x + dx, y: stagePos.y + dy })
          lastPointer.current = pointer
        }
        return
      }

      if (!isDrawing || tool === 'select') return

      const pos = getStagePointerPosition()
      setDrawPreview({
        type: tool as DrawingPreview['type'],
        x: drawStart.x,
        y: drawStart.y,
        width: pos.x - drawStart.x,
        height: pos.y - drawStart.y,
      })
    },
    [isPanning, isDrawing, tool, drawStart, getStagePointerPosition, stagePos, setStagePos, stageRef]
  )

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1) {
        isPanning.current = false
        return
      }

      if (!isDrawing || tool === 'select') {
        setIsDrawing(false)
        setDrawPreview(null)
        return
      }

      const pos = getStagePointerPosition()
      const dx = pos.x - drawStart.x
      const dy = pos.y - drawStart.y

      setIsDrawing(false)
      setDrawPreview(null)

      const isTinyDrag = Math.abs(dx) < 3 && Math.abs(dy) < 3

      if (isTinyDrag) {
        if (tool === 'rect') {
          const obj: CanvasObject = {
            id: crypto.randomUUID(),
            type: 'rect',
            x: drawStart.x - 50,
            y: drawStart.y - 40,
            width: 100,
            height: 80,
            fill: '#0057FF',
            stroke: '',
            strokeWidth: 0,
            opacity: 1,
            rotation: 0,
          }
          addObject(obj)
          setSelected(obj.id)
        } else if (tool === 'circle') {
          const obj: CanvasObject = {
            id: crypto.randomUUID(),
            type: 'circle',
            x: drawStart.x,
            y: drawStart.y,
            radius: 50,
            fill: '#00C9B1',
            stroke: '',
            strokeWidth: 0,
            opacity: 1,
            rotation: 0,
          }
          addObject(obj)
          setSelected(obj.id)
        } else if (tool === 'text') {
          const obj: CanvasObject = {
            id: crypto.randomUUID(),
            type: 'text',
            x: drawStart.x,
            y: drawStart.y,
            text: 'Type something',
            fontSize: 24,
            fill: '#0A0A0A',
            stroke: '',
            strokeWidth: 0,
            opacity: 1,
            rotation: 0,
          }
          addObject(obj)
          setSelected(obj.id)
        } else if (tool === 'line') {
          const obj: CanvasObject = {
            id: crypto.randomUUID(),
            type: 'line',
            x: drawStart.x,
            y: drawStart.y,
            width: 100,
            fill: 'transparent',
            stroke: '#0A0A0A',
            strokeWidth: 2,
            opacity: 1,
            rotation: 0,
          }
          addObject(obj)
          setSelected(obj.id)
        }
        return
      }

      if (tool === 'rect') {
        const x = Math.min(drawStart.x, pos.x)
        const y = Math.min(drawStart.y, pos.y)
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'rect',
          x,
          y,
          width: Math.abs(dx),
          height: Math.abs(dy),
          fill: '#0057FF',
          stroke: '',
          strokeWidth: 0,
          opacity: 1,
          rotation: 0,
        }
        addObject(obj)
        setSelected(obj.id)
      } else if (tool === 'circle') {
        const radius = Math.max(Math.abs(dx), Math.abs(dy)) / 2
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'circle',
          x: drawStart.x + dx / 2,
          y: drawStart.y + dy / 2,
          radius,
          fill: '#00C9B1',
          stroke: '',
          strokeWidth: 0,
          opacity: 1,
          rotation: 0,
        }
        addObject(obj)
        setSelected(obj.id)
      } else if (tool === 'text') {
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'text',
          x: drawStart.x,
          y: drawStart.y,
          text: 'Type something',
          fontSize: Math.max(12, Math.abs(dy)),
          fill: '#0A0A0A',
          stroke: '',
          strokeWidth: 0,
          opacity: 1,
          rotation: 0,
        }
        addObject(obj)
        setSelected(obj.id)
      } else if (tool === 'line') {
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'line',
          x: drawStart.x,
          y: drawStart.y,
          width: dx,
          fill: 'transparent',
          stroke: '#0A0A0A',
          strokeWidth: 2,
          opacity: 1,
          rotation: 0,
        }
        addObject(obj)
        setSelected(obj.id)
      }
    },
    [isDrawing, tool, drawStart, getStagePointerPosition, addObject, setSelected]
  )

  const getCursor = (): string => {
    if (isPanning.current) return 'grabbing'
    if (tool === 'select') return 'default'
    return 'crosshair'
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden canvas-bg"
      style={{ cursor: getCursor() }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
        onTouchMove={handleMouseMove as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
        onTouchEnd={handleMouseUp as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      >
        {/* Objects layer */}
        <Layer>
          {objects.map((obj) => (
            <CanvasShape
              key={obj.id}
              obj={obj}
              isSelected={selectedId === obj.id}
              onSelect={() => setSelected(obj.id)}
              onChange={(updates) => updateObject(obj.id, updates)}
            />
          ))}

          {/* Drawing preview */}
          <PreviewShape preview={drawPreview} />

          {/* Transformer */}
          <SelectionTransformer selectedId={selectedId} />
        </Layer>
      </Stage>
    </div>
  )
}
