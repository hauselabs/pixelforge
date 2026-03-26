export interface CanvasObject {
  id: string
  type: 'rect' | 'circle' | 'text' | 'line' | 'frame'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
  fontSize?: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  rotation: number
  // Frame-specific
  frameName?: string
}

export type Tool = 'select' | 'hand' | 'rect' | 'circle' | 'text' | 'line' | 'frame'
export type Mode = 'local' | 'collaborate'

export interface GradientInfo {
  type: 'linear' | 'radial'
  startColor: string
  endColor: string
}

export function parseGradient(fill: string): GradientInfo | null {
  if (!fill) return null
  const linearMatch = fill.match(/linear-gradient\([^,]+,\s*(#[0-9a-fA-F]{3,8}|[a-z]+),\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\)/)
  if (linearMatch) return { type: 'linear', startColor: linearMatch[1], endColor: linearMatch[2] }
  const radialMatch = fill.match(/radial-gradient\(\s*(#[0-9a-fA-F]{3,8}|[a-z]+),\s*(#[0-9a-fA-F]{3,8}|[a-z]+)\)/)
  if (radialMatch) return { type: 'radial', startColor: radialMatch[1], endColor: radialMatch[2] }
  return null
}

export function isGradient(fill: string): boolean {
  return fill?.startsWith('linear-gradient') || fill?.startsWith('radial-gradient')
}

// Frame presets
export const FRAME_PRESETS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Mobile', width: 390, height: 844 },
  { name: 'Tablet', width: 768, height: 1024 },
] as const
