import { createCanvas } from '@napi-rs/canvas'
import type { CanvasObject } from './types'

const DEFAULT_WIDTH = 1440
const DEFAULT_HEIGHT = 900

/**
 * Render canvas objects to a PNG buffer server-side.
 */
export function renderToPng(
  objects: CanvasObject[],
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  darkMode = false,
): Buffer {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = darkMode ? '#1a1a1e' : '#f8f8f6'
  ctx.fillRect(0, 0, width, height)

  // Sort: frames first (background), then other shapes
  const sorted = [...objects].sort((a, b) => {
    if (a.type === 'frame' && b.type !== 'frame') return -1
    if (a.type !== 'frame' && b.type === 'frame') return 1
    return 0
  })

  for (const obj of sorted) {
    ctx.save()
    ctx.globalAlpha = obj.opacity ?? 1

    // Translate + rotate
    if (obj.type === 'circle') {
      ctx.translate(obj.x, obj.y)
    } else {
      ctx.translate(obj.x + (obj.width ?? 0) / 2, obj.y + (obj.height ?? 0) / 2)
    }
    if (obj.rotation) {
      ctx.rotate((obj.rotation * Math.PI) / 180)
    }
    if (obj.type === 'circle') {
      // Already translated to center
    } else {
      ctx.translate(-(obj.width ?? 0) / 2, -(obj.height ?? 0) / 2)
    }

    switch (obj.type) {
      case 'frame': {
        const w = obj.width ?? 1440
        const h = obj.height ?? 900
        // Frame shadow
        ctx.shadowColor = 'rgba(0,0,0,0.08)'
        ctx.shadowBlur = 12
        ctx.shadowOffsetY = 2
        // Frame background
        ctx.fillStyle = darkMode ? '#27272a' : '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.shadowColor = 'transparent'
        // Frame border
        ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        ctx.lineWidth = 1
        ctx.strokeRect(0, 0, w, h)
        // Frame label
        if (obj.frameName) {
          ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
          ctx.font = '12px Inter, -apple-system, sans-serif'
          ctx.fillText(obj.frameName, 0, -8)
        }
        break
      }

      case 'rect': {
        const w = obj.width ?? 100
        const h = obj.height ?? 80
        if (obj.fill && obj.fill !== 'transparent') {
          ctx.fillStyle = resolveColor(ctx, obj.fill, w, h)
          ctx.beginPath()
          ctx.roundRect(0, 0, w, h, 0)
          ctx.fill()
        }
        if (obj.stroke && obj.strokeWidth) {
          ctx.strokeStyle = obj.stroke
          ctx.lineWidth = obj.strokeWidth
          ctx.strokeRect(0, 0, w, h)
        }
        break
      }

      case 'circle': {
        const r = obj.radius ?? 50
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        if (obj.fill && obj.fill !== 'transparent') {
          ctx.fillStyle = resolveColor(ctx, obj.fill, r * 2, r * 2, true)
          ctx.fill()
        }
        if (obj.stroke && obj.strokeWidth) {
          ctx.strokeStyle = obj.stroke
          ctx.lineWidth = obj.strokeWidth
          ctx.stroke()
        }
        break
      }

      case 'text': {
        const size = obj.fontSize ?? 24
        ctx.font = `${size}px Inter, -apple-system, sans-serif`
        ctx.fillStyle = obj.fill || (darkMode ? '#F0F0F0' : '#0A0A0A')
        ctx.fillText(obj.text ?? '', 0, size * 0.85)
        break
      }

      case 'line': {
        const len = obj.width ?? 100
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(len, 0)
        ctx.strokeStyle = obj.stroke || '#0A0A0A'
        ctx.lineWidth = obj.strokeWidth || 2
        ctx.lineCap = 'round'
        ctx.stroke()
        break
      }
    }

    ctx.restore()
  }

  return canvas.toBuffer('image/png')
}

function resolveColor(
  ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>,
  fill: string,
  w: number,
  h: number,
  isCircle = false,
): string | CanvasGradient {
  // Check for CSS gradient strings
  const linearMatch = fill.match(
    /linear-gradient\([^,]*,\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\s*,\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\s*\)/,
  )
  if (linearMatch) {
    const grad = isCircle
      ? ctx.createLinearGradient(-w / 2, 0, w / 2, 0)
      : ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, linearMatch[1])
    grad.addColorStop(1, linearMatch[2])
    return grad as unknown as CanvasGradient
  }

  const radialMatch = fill.match(
    /radial-gradient\(\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\s*,\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\s*\)/,
  )
  if (radialMatch) {
    const r = Math.max(w, h) / 2
    const grad = isCircle
      ? ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      : ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r)
    grad.addColorStop(0, radialMatch[1])
    grad.addColorStop(1, radialMatch[2])
    return grad as unknown as CanvasGradient
  }

  return fill
}
