import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all paths except: api, studio, _next internals, static files, favicons
  matcher: ['/((?!api|studio|_next|_vercel|.*\\..*).*)'],
}
