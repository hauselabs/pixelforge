import { createSurf, type SurfInstance } from '@surfjs/core'
import type { CanvasObject } from './types'

// In-memory canvas state for collaborative mode (server-side)
let canvasState: CanvasObject[] = []

/** Get current canvas state — used by export endpoint */
export function getCanvasState(): CanvasObject[] {
  return canvasState
}

// Surf instance — initialized lazily
let _surf: SurfInstance | null = null

// We use a getter so commands can reference the instance after init
function getSurf(): SurfInstance {
  if (!_surf) throw new Error('Surf instance not yet initialized')
  return _surf
}

/** Helper: create a shape object from params + type */
function buildShapeObject(
  type: CanvasObject['type'],
  params: Record<string, unknown>
): CanvasObject {
  const base = {
    id: crypto.randomUUID(),
    type,
    x: (params.x as number) ?? 100,
    y: (params.y as number) ?? 100,
    opacity: (params.opacity as number) ?? 1,
    rotation: (params.rotation as number) ?? 0,
  }

  switch (type) {
    case 'rect':
      return {
        ...base,
        width: (params.width as number) ?? 200,
        height: (params.height as number) ?? 150,
        fill: (params.fill as string) ?? '#2563EB',
        stroke: (params.stroke as string) ?? '',
        strokeWidth: (params.strokeWidth as number) ?? 0,
      }
    case 'circle':
      return {
        ...base,
        x: (params.x as number) ?? 200,
        y: (params.y as number) ?? 200,
        radius: (params.radius as number) ?? 80,
        fill: (params.fill as string) ?? '#00C9B1',
        stroke: (params.stroke as string) ?? '',
        strokeWidth: (params.strokeWidth as number) ?? 0,
      }
    case 'text':
      return {
        ...base,
        text: (params.text as string) ?? 'Hello',
        fontSize: (params.fontSize as number) ?? 24,
        fill: (params.fill as string) ?? '#0A0A0A',
        stroke: '',
        strokeWidth: 0,
      }
    case 'line':
      return {
        ...base,
        x: (params.x as number) ?? 50,
        y: (params.y as number) ?? 50,
        width: (params.width as number) ?? 200,
        fill: 'transparent',
        stroke: (params.stroke as string) ?? '#0A0A0A',
        strokeWidth: (params.strokeWidth as number) ?? 2,
      }
    case 'frame':
      return {
        ...base,
        width: (params.width as number) ?? 1440,
        height: (params.height as number) ?? 900,
        fill: (params.fill as string) ?? '#FFFFFF',
        stroke: (params.stroke as string) ?? '#E0E0E0',
        strokeWidth: (params.strokeWidth as number) ?? 1,
        frameName: (params.frameName as string) ?? 'Frame',
      }
    default:
      return {
        ...base,
        width: 200,
        height: 150,
        fill: (params.fill as string) ?? '#2563EB',
        stroke: (params.stroke as string) ?? '',
        strokeWidth: (params.strokeWidth as number) ?? 0,
      }
  }
}

/** Push object to state + broadcast */
function pushObject(obj: CanvasObject): void {
  canvasState = [...canvasState, obj]
  getSurf().live.setState('canvas', { objects: canvasState })
}

export const surfPromise: Promise<SurfInstance> = createSurf({
  name: 'PixelForge',
  description: 'AI design tool — create graphics through typed Surf commands. Add shapes, text, and designs to a shared canvas.',
  version: '2.0.0',
  baseUrl: '/api/surf',

  live: {
    enabled: true,
    allowedOrigins: ['*'],
  },

  commands: {
    'canvas.getState': {
      description: 'Get the current canvas state (all objects)',
      hints: { idempotent: true, sideEffects: false },
      run: async () => {
        return { objects: canvasState }
      },
    },

    'canvas.export': {
      description: 'Export the canvas as a PNG image. Returns a download URL. Use curl to save: curl -o design.png <pngUrl>',
      params: {
        width: { type: 'number', required: false, default: 1440, description: 'Export width in pixels' },
        height: { type: 'number', required: false, default: 900, description: 'Export height in pixels' },
        dark: { type: 'boolean', required: false, default: false, description: 'Use dark background' },
        format: { type: 'string', required: false, default: 'png', description: '"png" for image URL, "json" for raw data' },
      },
      hints: { idempotent: true, sideEffects: false },
      run: async (params) => {
        const width = (params.width as number) || 1440
        const height = (params.height as number) || 900
        const dark = params.dark === true

        if (params.format === 'json') {
          return {
            format: 'pixelforge-v2',
            exportedAt: new Date().toISOString(),
            objectCount: canvasState.length,
            objects: canvasState.map((obj) => ({ ...obj })),
          }
        }

        const qs = `width=${width}&height=${height}${dark ? '&dark=true' : ''}`

        return {
          objectCount: canvasState.length,
          exportedAt: new Date().toISOString(),
          downloadPath: `/api/export?${qs}`,
          hint: `Download PNG with: curl -o design.png "https://pixelforge-pearl.vercel.app/api/export?${qs}"`,
        }
      },
    },

    'canvas.addShape': {
      description: 'Add any shape to the canvas — unified endpoint. Accepts type (rect, circle, text, line, frame) and all shape-specific params.',
      params: {
        type: { type: 'string', required: true, description: 'Shape type: rect, circle, text, line, or frame' },
        x: { type: 'number', required: false, description: 'X position' },
        y: { type: 'number', required: false, description: 'Y position' },
        width: { type: 'number', required: false, description: 'Width (rect/line/frame)' },
        height: { type: 'number', required: false, description: 'Height (rect/frame)' },
        radius: { type: 'number', required: false, description: 'Radius (circle)' },
        fill: { type: 'string', required: false, description: 'Fill color (hex)' },
        stroke: { type: 'string', required: false, description: 'Stroke color' },
        strokeWidth: { type: 'number', required: false, description: 'Stroke width' },
        opacity: { type: 'number', required: false, description: '0.0–1.0' },
        rotation: { type: 'number', required: false, description: 'Rotation in degrees' },
        text: { type: 'string', required: false, description: 'Text content (text type only)' },
        fontSize: { type: 'number', required: false, description: 'Font size (text type only)' },
        frameName: { type: 'string', required: false, description: 'Frame label (frame type only)' },
      },
      run: async (params) => {
        const shapeType = params.type as string
        const validTypes = ['rect', 'circle', 'text', 'line', 'frame']
        if (!validTypes.includes(shapeType)) {
          return { ok: false, error: `Invalid type "${shapeType}". Must be one of: ${validTypes.join(', ')}` }
        }
        if (shapeType === 'text' && !params.text) {
          return { ok: false, error: 'Text shapes require a "text" parameter' }
        }
        const obj = buildShapeObject(shapeType as CanvasObject['type'], params)
        pushObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addRect': {
      description: 'Add a rectangle to the canvas',
      params: {
        x: { type: 'number', required: false, default: 100, description: 'X position' },
        y: { type: 'number', required: false, default: 100, description: 'Y position' },
        width: { type: 'number', required: false, default: 200, description: 'Width in pixels' },
        height: { type: 'number', required: false, default: 150, description: 'Height in pixels' },
        fill: { type: 'string', required: false, default: '#2563EB', description: 'Fill color (hex)' },
        stroke: { type: 'string', required: false, default: '', description: 'Stroke/border color' },
        strokeWidth: { type: 'number', required: false, default: 0, description: 'Border width' },
        opacity: { type: 'number', required: false, default: 1, description: '0.0–1.0' },
        rotation: { type: 'number', required: false, default: 0, description: 'Rotation in degrees' },
      },
      run: async (params) => {
        const obj = buildShapeObject('rect', params)
        pushObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addCircle': {
      description: 'Add a circle to the canvas',
      params: {
        x: { type: 'number', required: false, default: 200, description: 'Center X position' },
        y: { type: 'number', required: false, default: 200, description: 'Center Y position' },
        radius: { type: 'number', required: false, default: 80, description: 'Radius in pixels' },
        fill: { type: 'string', required: false, default: '#00C9B1', description: 'Fill color (hex)' },
        stroke: { type: 'string', required: false, default: '', description: 'Stroke color' },
        strokeWidth: { type: 'number', required: false, default: 0 },
        opacity: { type: 'number', required: false, default: 1, description: '0.0–1.0' },
        rotation: { type: 'number', required: false, default: 0 },
      },
      run: async (params) => {
        const obj = buildShapeObject('circle', params)
        pushObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addText': {
      description: 'Add text to the canvas',
      params: {
        x: { type: 'number', required: false, default: 100, description: 'X position' },
        y: { type: 'number', required: false, default: 100, description: 'Y position' },
        text: { type: 'string', required: true, description: 'The text content to display' },
        fontSize: { type: 'number', required: false, default: 24, description: 'Font size in pixels' },
        fill: { type: 'string', required: false, default: '#0A0A0A', description: 'Text color (hex)' },
        opacity: { type: 'number', required: false, default: 1 },
        rotation: { type: 'number', required: false, default: 0 },
      },
      run: async (params) => {
        const obj = buildShapeObject('text', params)
        pushObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addLine': {
      description: 'Add a line to the canvas',
      params: {
        x: { type: 'number', required: false, default: 50, description: 'Start X position' },
        y: { type: 'number', required: false, default: 50, description: 'Start Y position' },
        width: { type: 'number', required: false, default: 200, description: 'Line length in pixels' },
        stroke: { type: 'string', required: false, default: '#0A0A0A', description: 'Line color' },
        strokeWidth: { type: 'number', required: false, default: 2, description: 'Line thickness' },
        rotation: { type: 'number', required: false, default: 0, description: 'Rotation in degrees' },
        opacity: { type: 'number', required: false, default: 1 },
      },
      run: async (params) => {
        const obj = buildShapeObject('line', params)
        pushObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.updateObject': {
      description: 'Update properties of an existing canvas object by ID',
      params: {
        id: { type: 'string', required: true, description: 'Object ID to update (get IDs from canvas.getState)' },
        x: { type: 'number', required: false, description: 'New X position' },
        y: { type: 'number', required: false, description: 'New Y position' },
        width: { type: 'number', required: false },
        height: { type: 'number', required: false },
        radius: { type: 'number', required: false },
        fill: { type: 'string', required: false, description: 'New fill color' },
        stroke: { type: 'string', required: false },
        strokeWidth: { type: 'number', required: false },
        opacity: { type: 'number', required: false, description: '0.0–1.0' },
        rotation: { type: 'number', required: false, description: 'Degrees' },
        text: { type: 'string', required: false, description: 'For text objects only' },
        fontSize: { type: 'number', required: false, description: 'For text objects only' },
        frameName: { type: 'string', required: false, description: 'For frame objects only' },
      },
      run: async (params) => {
        const idx = canvasState.findIndex((o) => o.id === params.id)
        if (idx === -1) return { ok: false, error: 'Object not found' }

        const updates: Partial<CanvasObject> = {}
        const keys: (keyof CanvasObject)[] = ['x', 'y', 'width', 'height', 'radius', 'fill', 'stroke', 'strokeWidth', 'opacity', 'rotation', 'text', 'fontSize', 'frameName']
        for (const key of keys) {
          if (params[key] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(updates as any)[key] = params[key]
          }
        }

        const newState = [...canvasState]
        newState[idx] = { ...newState[idx], ...updates }
        canvasState = newState
        getSurf().live.setState('canvas', { objects: canvasState })
        return { ok: true, object: canvasState[idx] }
      },
    },

    'canvas.removeObject': {
      description: 'Remove an object from the canvas by ID',
      params: {
        id: { type: 'string', required: true, description: 'Object ID to remove' },
      },
      run: async (params) => {
        canvasState = canvasState.filter((o) => o.id !== params.id)
        getSurf().live.setState('canvas', { objects: canvasState })
        return { ok: true }
      },
    },

    'canvas.clear': {
      description: 'Clear the entire canvas — removes all objects',
      run: async () => {
        canvasState = []
        getSurf().live.setState('canvas', { objects: canvasState })
        return { ok: true }
      },
    },

    'canvas.setGradient': {
      description: 'Apply a gradient fill to an object (rect or circle)',
      params: {
        id: { type: 'string', required: true, description: 'Object ID' },
        type: { type: 'string', required: false, default: 'linear', description: '"linear" or "radial"' },
        startColor: { type: 'string', required: true, description: 'Start color (hex, e.g. #2563EB)' },
        endColor: { type: 'string', required: true, description: 'End color (hex, e.g. #00C9B1)' },
      },
      run: async (params) => {
        const idx = canvasState.findIndex((o) => o.id === params.id)
        if (idx === -1) return { ok: false, error: 'Object not found' }
        const gradient =
          params.type === 'radial'
            ? `radial-gradient(${params.startColor}, ${params.endColor})`
            : `linear-gradient(135deg, ${params.startColor}, ${params.endColor})`
        const newState = [...canvasState]
        newState[idx] = { ...newState[idx], fill: gradient }
        canvasState = newState
        getSurf().live.setState('canvas', { objects: canvasState })
        return { ok: true, object: canvasState[idx] }
      },
    },

    'canvas.alignObjects': {
      description: 'Align all canvas objects relative to canvas center (800×600)',
      params: {
        alignment: {
          type: 'string',
          required: false,
          default: 'center',
          description: '"center", "left", "right", "top", "bottom"',
        },
      },
      run: async (params) => {
        const cx = 400
        const cy = 300
        const alignment = (params.alignment as string) || 'center'

        const newState = canvasState.map((obj) => {
          const w = obj.width ?? (obj.radius ? obj.radius * 2 : 50)
          const h = obj.height ?? (obj.radius ? obj.radius * 2 : 50)
          let x = obj.x
          let y = obj.y
          if (alignment === 'center') {
            x = cx - w / 2
            y = cy - h / 2
          } else if (alignment === 'left') {
            x = 20
          } else if (alignment === 'right') {
            x = 800 - w - 20
          } else if (alignment === 'top') {
            y = 20
          } else if (alignment === 'bottom') {
            y = 600 - h - 20
          }
          return { ...obj, x, y }
        })

        canvasState = newState
        getSurf().live.setState('canvas', { objects: canvasState })
        return { ok: true, count: canvasState.length }
      },
    },
  },
}).then((instance) => {
  _surf = instance
  return instance
})

export async function getOrCreateSurf(): Promise<SurfInstance> {
  return surfPromise
}
