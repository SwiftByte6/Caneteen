import { NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabaseServer'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Skip middleware for Next.js internal routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  const supabase = supabaseServerClient(request.cookies)

  try {
    // Check if user has a valid session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // If no session, redirect to home for protected routes
    if (sessionError || !session) {
      if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return NextResponse.next()
    }

    // Get user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // If profile fetch fails, redirect user routes to home, admin routes to user dashboard
    if (profileError || !profile) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/user/dashboard', request.url))
      }
      if (pathname.startsWith('/user')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return NextResponse.next()
    }

    const userRole = profile.role?.trim().toLowerCase()

    // Handle login page redirects
    if (pathname === '/login') {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }

    // Protect admin routes - only allow admin users
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url))
      }
    }

    // Protect user routes - only allow regular users
    if (pathname.startsWith('/user')) {
      if (userRole !== 'user') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, redirect protected routes to home
    if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login'],
}
