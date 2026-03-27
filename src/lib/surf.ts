import { createSurf, type SurfInstance } from '@surfjs/core'
import type { CanvasObject } from './types'

/** Server-side stub for browser-only commands */
const browserOnly = async () => ({
  ok: false,
  error: 'This command executes in the browser only. Use a browser agent or window.surf.execute() in the page.',
})

// Surf instance — initialized lazily
let _surf: SurfInstance | null = null

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
    // ── Read-only commands (keep server-side run handlers) ──────────

    'canvas.getState': {
      description: 'Get the current canvas state (all objects). In browser mode, returns live Zustand state. Via CLI/server, returns empty (state lives in browser).',
      hints: { execution: 'any', idempotent: true, sideEffects: false },
      run: async () => {
        // Server-side fallback: state lives in browser now, so headless gets empty
        return { objects: [], note: 'Canvas state lives in the browser. Use a browser agent for live state.' }
      },
    },

    'canvas.export': {
      description: 'Export the canvas as a PNG image or JSON. In browser mode, pass objects param. For server-side, POST objects to /api/export.',
      params: {
        width: { type: 'number', required: false, default: 1440, description: 'Export width in pixels' },
        height: { type: 'number', required: false, default: 900, description: 'Export height in pixels' },
        dark: { type: 'boolean', required: false, default: false, description: 'Use dark background' },
        format: { type: 'string', required: false, default: 'png', description: '"png" for image URL, "json" for raw data' },
        objects: { type: 'array', required: false, description: 'Canvas objects to export (pass from browser state)' },
      },
      hints: { execution: 'any', idempotent: true, sideEffects: false },
      run: async (params) => {
        const width = (params.width as number) || 1440
        const height = (params.height as number) || 900
        const dark = params.dark === true
        const objects = (params.objects as CanvasObject[]) || []

        if (params.format === 'json') {
          return {
            format: 'pixelforge-v2',
            exportedAt: new Date().toISOString(),
            objectCount: objects.length,
            objects: objects.map((obj) => ({ ...obj })),
          }
        }

        const qs = `width=${width}&height=${height}${dark ? '&dark=true' : ''}`

        return {
          objectCount: objects.length,
          exportedAt: new Date().toISOString(),
          downloadPath: `/api/export?${qs}`,
          hint: `For server-side PNG export, POST objects to /api/export. For browser export, use Konva's toDataURL().`,
        }
      },
    },

    // ── Mutation commands (browser-only execution, declaration-only on server) ──

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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
    },

    'canvas.removeObject': {
      description: 'Remove an object from the canvas by ID',
      params: {
        id: { type: 'string', required: true, description: 'Object ID to remove' },
      },
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
    },

    'canvas.clear': {
      description: 'Clear the entire canvas — removes all objects',
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
    },

    'canvas.setGradient': {
      description: 'Apply a gradient fill to an object (rect or circle)',
      params: {
        id: { type: 'string', required: true, description: 'Object ID' },
        type: { type: 'string', required: false, default: 'linear', description: '"linear" or "radial"' },
        startColor: { type: 'string', required: true, description: 'Start color (hex, e.g. #2563EB)' },
        endColor: { type: 'string', required: true, description: 'End color (hex, e.g. #00C9B1)' },
      },
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
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
      hints: { execution: 'browser', sideEffects: true },
      run: browserOnly,
    },
  },
}).then((instance) => {
  _surf = instance
  return instance
})

export async function getOrCreateSurf(): Promise<SurfInstance> {
  return surfPromise
}
