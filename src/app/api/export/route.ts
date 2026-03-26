import { NextResponse } from 'next/server'
import { renderToPng } from '@/lib/renderer'
import { getCanvasState } from '@/lib/surf'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const width = parseInt(url.searchParams.get('width') ?? '1440', 10)
  const height = parseInt(url.searchParams.get('height') ?? '900', 10)
  const dark = url.searchParams.get('dark') === 'true'

  const objects = getCanvasState()
  const png = renderToPng(objects, width, height, dark)

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="pixelforge-export.png"',
      'Cache-Control': 'no-cache',
    },
  })
}
