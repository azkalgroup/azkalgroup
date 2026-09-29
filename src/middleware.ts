import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Cek apakah user sudah login (menggunakan dummy cookie 'auth-token')
  const isAuthenticated = request.cookies.has('auth-token')

  // Pengecualian path yang tidak perlu di-redirect
  const isPublicPath = request.nextUrl.pathname.startsWith('/login')

  // Jika belum login dan mencoba mengakses halaman selain login, arahkan ke login
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika sudah login dan mencoba mengakses halaman login, arahkan ke beranda
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Tentukan path mana saja yang akan dilewati oleh middleware ini
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
