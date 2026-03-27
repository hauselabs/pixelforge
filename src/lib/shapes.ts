import type { CanvasObject } from './types'

/** Helper: create a shape object from params + type */
export function buildShapeObject(
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
