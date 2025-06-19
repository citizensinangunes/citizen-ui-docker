import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Processing request:', request.url);
  
  // Only perform token validation on protected routes
  const isProtectedRoute = 
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.includes('.');

  if (isProtectedRoute) {
    console.log('[MIDDLEWARE] Protected route accessed:', request.nextUrl.pathname);
    
    // Check if token exists in cookie
    const token = request.cookies.get('auth_token');
    
    // Note: We can't check localStorage from middleware because it runs on the server
    // Client-side authentication will be handled by the AuthContext
    
    if (!token || !token.value) {
      console.log('[MIDDLEWARE] No auth token found in cookies');
      // Don't redirect here, let the client-side handle auth
      // Just pass through and let the client decide
    } else {
      console.log('[MIDDLEWARE] Auth token found in cookies, allowing request');
    }
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // If token exists, ensure it's preserved
  const token = request.cookies.get('auth_token');
  if (token && token.value) {
    response.cookies.set({
      name: 'auth_token',
      value: token.value,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });
  }
  
  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/** (authentication API routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /citizen-logo.svg (logo file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|citizen-logo.svg).*)',
  ],
}; 