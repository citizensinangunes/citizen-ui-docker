import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('[ME-API] /me endpoint called');
    // Get token from multiple possible sources
    let token = null;
    
    // 1. Try Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"
      console.log('[ME-API] Token found in Authorization header');
    }
    
    // 2. Try custom X-Auth-Token header
    if (!token) {
      const customToken = request.headers.get('x-auth-token');
      if (customToken) {
        token = customToken;
        console.log('[ME-API] Token found in X-Auth-Token header');
      }
    }
    
    // 3. Try cookie
    if (!token) {
      const authCookie = request.cookies.get('auth_token');
      if (authCookie && authCookie.value) {
        token = authCookie.value;
        console.log('[ME-API] Token found in auth_token cookie');
      } else {
        // Read cookies manually from header
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          console.log('[ME-API] Cookie header found:', cookieHeader);
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          token = cookies['auth_token'];
          if (token) {
            console.log('[ME-API] Token found in cookies');
          } else {
            console.log('[ME-API] No auth_token found in cookies');
          }
        } else {
          console.log('[ME-API] No cookie header found');
        }
      }
    }

    if (!token) {
      console.log('[ME-API] No token found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('[ME-API] Verifying token (truncated):', token.substring(0, 15) + '...');
    
    // Verify the token
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.log('[ME-API] Token verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('[ME-API] Token verified for user ID:', decoded.userId);
    
    // Get user data from database
    console.log('[ME-API] Fetching user data from database');
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      console.log('[ME-API] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    console.log('[ME-API] User data retrieved successfully');
    
    // Extract first and last name from name field
    const nameParts = user.name ? user.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Return user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        firstName: firstName,
        lastName: lastName,
        name: user.name,
        email: user.email,
        role: 'admin' // Default role
      }
    });
    
    // Ensure cookie is preserved in response
    const authToken = request.cookies.get('auth_token');
    if (authToken) {
      console.log('[ME-API] Preserving auth_token cookie in response');
      response.cookies.set({
        name: 'auth_token',
        value: authToken.value,
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 // 24 hours
      });
    }
    
    console.log('[ME-API] Returning user data successfully');
    return response;
  } catch (error) {
    console.error('[ME-API] Error getting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 