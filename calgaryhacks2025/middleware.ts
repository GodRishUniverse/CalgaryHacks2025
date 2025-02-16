import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return res
  } catch (e) {
    console.error('Middleware error:', e)
    return NextResponse.next()
  }
}

// Only run middleware on auth-related routes
export const config = {
  matcher: ['/auth/callback', '/login', '/dashboard'],
}
