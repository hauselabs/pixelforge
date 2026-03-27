'use client'

import { SurfBadge } from '@surfjs/react'

export function SurfBadgeWrapper() {
  const endpoint =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://pixelforge-pearl.vercel.app'

  return (
    <SurfBadge
      endpoint={endpoint}
      name="PixelForge"
      description="AI design tool — create graphics through Surf commands"
      position="bottom-right"
      theme="auto"
      commands={[
        { name: 'canvas.addShape', description: 'Add any shape (rect, circle, text, line, frame)' },
        { name: 'canvas.addRect', description: 'Add a rectangle' },
        { name: 'canvas.addCircle', description: 'Add a circle' },
        { name: 'canvas.addText', description: 'Add text' },
        { name: 'canvas.addLine', description: 'Add a line' },
        { name: 'canvas.getState', description: 'Get canvas state' },
        { name: 'canvas.export', description: 'Export canvas' },
        { name: 'canvas.updateObject', description: 'Update object properties' },
        { name: 'canvas.removeObject', description: 'Remove object by ID' },
        { name: 'canvas.clear', description: 'Clear canvas' },
        { name: 'canvas.setGradient', description: 'Apply gradient fill' },
        { name: 'canvas.alignObjects', description: 'Align all objects' },
      ]}
    />
  )
}
