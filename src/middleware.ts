import { surfMiddleware } from '@surfjs/next/middleware'

export default surfMiddleware()

export const config = {
  matcher: ['/.well-known/surf.json'],
}
