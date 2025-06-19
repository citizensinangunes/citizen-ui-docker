import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    console.log('[LOGIN-API] Login attempt started');
    const { email, password } = await request.json();
    console.log('[LOGIN-API] Email provided:', email);

    // Input validation
    if (!email || !password) {
      console.log('[LOGIN-API] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query the database to find the user by email
    console.log('[LOGIN-API] Querying database for user');
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      console.log('[LOGIN-API] User not found');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[LOGIN-API] User found, verifying password');
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('[LOGIN-API] Password mismatch');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[LOGIN-API] Password verified, creating session');
    // Create session and get token
    const token = await createSession(user.id);
    console.log('[LOGIN-API] Session created with token (truncated):', token.substring(0, 15) + '...');

    // Update user's last login time - check if column exists first to avoid errors
    try {
      console.log('[LOGIN-API] Updating last login time');
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
      console.log('[LOGIN-API] Last login time updated');
    } catch (loginTimeError) {
      console.warn('[LOGIN-API] Could not update login time:', loginTimeError);
      // Continue execution even if this fails
    }

    // Extract first and last name from name field
    const nameParts = user.name ? user.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    console.log('[LOGIN-API] Creating response with token');
    // Set cookie in response
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        name: user.name,
        role: 'admin' // Default role
      }
    });

    // Set the auth_token cookie with longer expiration
    console.log('[LOGIN-API] Setting auth_token cookie');
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('[LOGIN-API] Login successful for user:', user.id);
    return response;
  } catch (error) {
    console.error('[LOGIN-API] Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 