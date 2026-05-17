// middleware.ts (à la racine du projet, au même niveau que app/)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/cages',
  '/pigeons',
  '/couples',
  '/reproductions',
  '/sales',
  '/profile',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isProtected = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (!isProtected) return NextResponse.next()
  
  // Vérifie le token dans le cookie
  const token = request.cookies.get('access_token')?.value
  
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}