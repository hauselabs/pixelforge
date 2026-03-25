import { createSurf, type SurfInstance } from '@surfjs/core'
import type { CanvasObject } from './types'

// In-memory canvas state for collaborative mode (server-side)
let canvasState: CanvasObject[] = []

// Surf instance — initialized lazily
let _surf: SurfInstance | null = null

// We use a getter so commands can reference the instance after init
function getSurf(): SurfInstance {
  if (!_surf) throw new Error('Surf instance not yet initialized')
  return _surf
}

export const surfPromise: Promise<SurfInstance> = createSurf({
  name: 'PixelForge',
  description: 'AI design tool — create graphics through typed Surf commands. Add shapes, text, and designs to a shared canvas.',
  version: '1.0.0',

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

    'canvas.addRect': {
      description: 'Add a rectangle to the canvas',
      params: {
        x: { type: 'number', required: false, default: 100, description: 'X position' },
        y: { type: 'number', required: false, default: 100, description: 'Y position' },
        width: { type: 'number', required: false, default: 200, description: 'Width in pixels' },
        height: { type: 'number', required: false, default: 150, description: 'Height in pixels' },
        fill: { type: 'string', required: false, default: '#0057FF', description: 'Fill color (hex)' },
        stroke: { type: 'string', required: false, default: '', description: 'Stroke/border color' },
        strokeWidth: { type: 'number', required: false, default: 0, description: 'Border width' },
        opacity: { type: 'number', required: false, default: 1, description: '0.0–1.0' },
        rotation: { type: 'number', required: false, default: 0, description: 'Rotation in degrees' },
      },
      run: async (params) => {
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'rect',
          x: params.x as number,
          y: params.y as number,
          width: params.width as number,
          height: params.height as number,
          fill: params.fill as string,
          stroke: params.stroke as string,
          strokeWidth: params.strokeWidth as number,
          opacity: params.opacity as number,
          rotation: params.rotation as number,
        }
        canvasState = [...canvasState, obj]
        getSurf().live.setState('canvas', { objects: canvasState })
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
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'circle',
          x: params.x as number,
          y: params.y as number,
          radius: params.radius as number,
          fill: params.fill as string,
          stroke: params.stroke as string,
          strokeWidth: params.strokeWidth as number,
          opacity: params.opacity as number,
          rotation: params.rotation as number,
        }
        canvasState = [...canvasState, obj]
        getSurf().live.setState('canvas', { objects: canvasState })
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
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'text',
          x: params.x as number,
          y: params.y as number,
          text: params.text as string,
          fontSize: params.fontSize as number,
          fill: params.fill as string,
          stroke: '',
          strokeWidth: 0,
          opacity: params.opacity as number,
          rotation: params.rotation as number,
        }
        canvasState = [...canvasState, obj]
        getSurf().live.setState('canvas', { objects: canvasState })
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
        const obj: CanvasObject = {
          id: crypto.randomUUID(),
          type: 'line',
          x: params.x as number,
          y: params.y as number,
          width: params.width as number,
          fill: 'transparent',
          stroke: params.stroke as string,
          strokeWidth: params.strokeWidth as number,
          opacity: params.opacity as number,
          rotation: params.rotation as number,
        }
        canvasState = [...canvasState, obj]
        getSurf().live.setState('canvas', { objects: canvasState })
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
      },
      run: async (params) => {
        const idx = canvasState.findIndex((o) => o.id === params.id)
        if (idx === -1) return { ok: false, error: 'Object not found' }

        // Only apply defined (non-undefined) fields
        const updates: Partial<CanvasObject> = {}
        const keys: (keyof CanvasObject)[] = ['x', 'y', 'width', 'height', 'radius', 'fill', 'stroke', 'strokeWidth', 'opacity', 'rotation', 'text', 'fontSize']
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
        startColor: { type: 'string', required: true, description: 'Start color (hex, e.g. #0057FF)' },
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
