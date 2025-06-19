import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Check if there are any users in the system
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const userCount = parseInt(result.rows[0].user_count);
    
    // If no users exist, this is the first time setup
    const isFirstTime = userCount === 0;
    
    return NextResponse.json({ 
      isFirstTime,
      userCount 
    });
  } catch (error) {
    console.error('Error checking first time setup:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
} 