import { createSurfRouteHandler } from '@surfjs/next'
import { getOrCreateSurf } from '@/lib/surf'

// Lazily initialize the route handlers (surf requires async init)
const handlersPromise = getOrCreateSurf().then((surf) =>
  createSurfRouteHandler(surf, { basePath: '/api/surf' })
)

export async function GET(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { GET: handler } = await handlersPromise
  return handler(request, context)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { POST: handler } = await handlersPromise
  return handler(request, context)
}
