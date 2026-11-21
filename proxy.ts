import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes protégées (nécessitent authentification)
const PROTECTED_ROUTES = [
  '/',            // Dashboard (route group (dashboard))
  '/cages',
  '/pigeons',
  '/couples',
  '/reproductions',
  '/sales',
  '/historique',
  '/profile',
]

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Vérifie si la route est protégée
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Si route publique, laisser passer
  if (!isProtected) {
    return NextResponse.next()
  }

  // Vérifie le token d'authentification dans les cookies
  const token = request.cookies.get('access_token')?.value

  // Si pas de token → redirige vers login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuration : matcher sur toutes les routes sauf les fichiers statiques
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}