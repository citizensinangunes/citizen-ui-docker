import jwt from 'jsonwebtoken';
import { validateSession } from './session';

interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Secret key for JWT (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
export function generateToken(user: {
  id: number;
  email: string;
  name: string;
}): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'admin', // Default role
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Verify JWT token - updated to check database sessions
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    console.log('[AUTH] Token verification process started');
    console.log('[AUTH] Token (truncated):', token.substring(0, 15) + '...');
    
    // First, verify the JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      console.log('[AUTH] JWT signature verification passed');
    } catch (jwtError) {
      console.error('[AUTH] JWT signature verification failed:', jwtError);
      return null;
    }
    
    // Then check if this token exists in the database
    try {
      const userId = await validateSession(token);
      console.log('[AUTH] Database session check result:', userId ? 'Valid' : 'Invalid');
      
      if (!userId) {
        console.log('[AUTH] Token valid in JWT but not found in database');
        return null;
      }
      
      if (userId !== decoded.userId) {
        console.log('[AUTH] User ID mismatch - JWT:', decoded.userId, 'DB:', userId);
        return null;
      }
    } catch (dbError) {
      console.error('[AUTH] Database session check error:', dbError);
      return null;
    }
    
    console.log('[AUTH] Token fully verified for user:', decoded.userId);
    return decoded;
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error);
    return null;
  }
}

// Legacy verifyToken that only checks JWT signature
export function verifyTokenJWT(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error);
    return null;
  }
}

// Function to safely parse token payload (without verification)
export function parseToken(token: string): TokenPayload | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('[AUTH] Token parsing failed:', error);
    return null;
  }
} 