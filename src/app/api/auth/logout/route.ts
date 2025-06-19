import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  console.log('[LOGOUT-API] Logout request received');
  
  try {
    // Get token from multiple sources
    let token = null;
    
    // 1. Check authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      token = authHeader.split(' ')[1];
      console.log('[LOGOUT-API] Token found in Authorization header');
    }
    
    // 2. Check custom header
    if (!token) {
      const customToken = request.headers.get('x-auth-token');
      if (customToken) {
        token = customToken;
        console.log('[LOGOUT-API] Token found in X-Auth-Token header');
      }
    }
    
    // 3. Check cookie
    if (!token) {
      const cookieToken = request.cookies.get('auth_token')?.value;
      if (cookieToken) {
        token = cookieToken;
        console.log('[LOGOUT-API] Token found in cookie');
      }
    }
    
    if (token) {
      console.log('[LOGOUT-API] Found token, attempting to delete session');
      // Delete the session from database
      await deleteSession(token);
      console.log('[LOGOUT-API] Session deleted from database');
    } else {
      console.log('[LOGOUT-API] No token found in request');
    }
    
    // Create a response object
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
    
    // Clear auth cookie
    console.log('[LOGOUT-API] Clearing auth_token cookie');
    response.cookies.set({
      name: 'auth_token',
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    });
    
    console.log('[LOGOUT-API] Logout successful');
    return response;
  } catch (error) {
    console.error('[LOGOUT-API] Error during logout:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error during logout' 
    }, { status: 500 });
  }
} 