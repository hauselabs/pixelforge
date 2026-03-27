'use client'

import { useSurfCommands } from '@surfjs/react'
import { useCanvasStore } from '@/lib/store'
import { buildShapeObject } from '@/lib/shapes'
import type { CanvasObject } from '@/lib/types'

export function SurfCommands() {
  // We grab store for the initial registration, but inside handlers
  // we use useCanvasStore.getState() to always read fresh state.
  const store = useCanvasStore()

  useSurfCommands({
    'canvas.getState': {
      mode: 'local',
      run: () => {
        const { objects } = useCanvasStore.getState()
        return { objects }
      },
    },

    'canvas.addRect': {
      mode: 'local',
      run: (params) => {
        const obj = buildShapeObject('rect', params)
        useCanvasStore.getState().addObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addCircle': {
      mode: 'local',
      run: (params) => {
        const obj = buildShapeObject('circle', params)
        useCanvasStore.getState().addObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addText': {
      mode: 'local',
      run: (params) => {
        if (!params.text) return { ok: false, error: 'Text shapes require a "text" parameter' }
        const obj = buildShapeObject('text', params)
        useCanvasStore.getState().addObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addLine': {
      mode: 'local',
      run: (params) => {
        const obj = buildShapeObject('line', params)
        useCanvasStore.getState().addObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.addShape': {
      mode: 'local',
      run: (params) => {
        const type = params.type as string
        const validTypes = ['rect', 'circle', 'text', 'line', 'frame']
        if (!validTypes.includes(type)) {
          return { ok: false, error: `Invalid type "${type}". Must be one of: ${validTypes.join(', ')}` }
        }
        if (type === 'text' && !params.text) {
          return { ok: false, error: 'Text shapes require a "text" parameter' }
        }
        const obj = buildShapeObject(type as CanvasObject['type'], params)
        useCanvasStore.getState().addObject(obj)
        return { ok: true, object: obj }
      },
    },

    'canvas.updateObject': {
      mode: 'local',
      run: (params) => {
        const id = params.id as string
        const state = useCanvasStore.getState()
        const obj = state.objects.find((o) => o.id === id)
        if (!obj) return { ok: false, error: 'Object not found' }

        const updates: Partial<CanvasObject> = {}
        const keys = [
          'x', 'y', 'width', 'height', 'radius', 'fill', 'stroke',
          'strokeWidth', 'opacity', 'rotation', 'text', 'fontSize', 'frameName',
        ]
        for (const key of keys) {
          if (params[key] !== undefined) (updates as Record<string, unknown>)[key] = params[key]
        }

        state.updateObject(id, updates)
        return { ok: true, object: { ...obj, ...updates } }
      },
    },

    'canvas.removeObject': {
      mode: 'local',
      run: (params) => {
        useCanvasStore.getState().removeObject(params.id as string)
        return { ok: true }
      },
    },

    'canvas.clear': {
      mode: 'local',
      run: () => {
        useCanvasStore.getState().clearCanvas()
        return { ok: true }
      },
    },

    'canvas.setGradient': {
      mode: 'local',
      run: (params) => {
        const state = useCanvasStore.getState()
        const obj = state.objects.find((o) => o.id === params.id)
        if (!obj) return { ok: false, error: 'Object not found' }

        const gradient = params.type === 'radial'
          ? `radial-gradient(${params.startColor}, ${params.endColor})`
          : `linear-gradient(135deg, ${params.startColor}, ${params.endColor})`

        state.updateObject(params.id as string, { fill: gradient })
        return { ok: true, object: { ...obj, fill: gradient } }
      },
    },

    'canvas.alignObjects': {
      mode: 'local',
      run: (params) => {
        const state = useCanvasStore.getState()
        const objects = state.objects
        const cx = 400
        const cy = 300
        const alignment = (params.alignment as string) || 'center'

        const aligned = objects.map((obj) => {
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

        state.setObjects(aligned)
        return { ok: true, count: aligned.length }
      },
    },
  })

  return null
}
