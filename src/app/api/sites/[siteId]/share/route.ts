import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    // Generate unique token for the invitation
    const token = uuidv4();
    
    // In a real app, you would save this to database:
    // - token
    // - siteId
    // - role: 'viewer'
    // - expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    // - createdAt: new Date()
    
    // For now, we'll return mock data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/auth?invite=${token}&site=${siteId}`;
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        siteId,
        role: 'viewer',
        inviteLink,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating site invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
} 