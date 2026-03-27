import { NextResponse, NextRequest } from 'next/server'
import { renderToPng } from '@/lib/renderer'
import type { CanvasObject } from '@/lib/types'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const width = parseInt(url.searchParams.get('width') ?? '1440', 10)
  const height = parseInt(url.searchParams.get('height') ?? '900', 10)
  const dark = url.searchParams.get('dark') === 'true'

  // State now lives in the browser — GET export with no objects returns empty canvas
  const objects: CanvasObject[] = []
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

/** POST /api/export — accepts objects from the browser for server-side PNG rendering */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const objects: CanvasObject[] = body.objects ?? []
  const width = (body.width as number) || 1440
  const height = (body.height as number) || 900
  const dark = body.dark === true

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
