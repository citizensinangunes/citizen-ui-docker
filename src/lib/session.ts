import pool from './db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 24 saat olarak token süresi
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 saat (saniye cinsinden)

export async function createSession(userId: number): Promise<string> {
  try {
    // JWT token oluştur
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Token'ın süresini hesapla
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + TOKEN_EXPIRY);
    
    // Önce varolan oturumları temizle (isteğe bağlı)
    await pool.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [userId]
    );
    
    // Veritabanına token'ı kaydet
    await pool.query(
      `INSERT INTO user_sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
    
    return token;
  } catch (error) {
    console.error('Oturum oluşturma hatası:', error);
    throw new Error('Oturum oluşturulamadı');
  }
}

export async function validateSession(token: string): Promise<number | null> {
  try {
    console.log('[SESSION] Validating session token (truncated):', token.substring(0, 15) + '...');
    
    // Token geçerli mi kontrol et
    const sessionQuery = await pool.query(
      `SELECT user_id, expires_at FROM user_sessions
       WHERE token = $1`,
      [token]
    );
    
    if (sessionQuery.rows.length === 0) {
      console.log('[SESSION] Token not found in database');
      return null;
    }
    
    console.log('[SESSION] Token found in database');
    
    const session = sessionQuery.rows[0];
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    console.log('[SESSION] Expiration check - Current time:', now.toISOString(), 'Expires at:', expiresAt.toISOString());
    
    // Süresi dolmuş mu kontrol et
    if (now > expiresAt) {
      console.log('[SESSION] Token has expired');
      // Süresi dolmuş token'ı sil
      await pool.query(
        'DELETE FROM user_sessions WHERE token = $1',
        [token]
      );
      return null;
    }
    
    // Token geçerli, kullanıcı ID'sini döndür
    console.log('[SESSION] Token is valid for user:', session.user_id);
    return session.user_id;
  } catch (error) {
    console.error('[SESSION] Session validation error:', error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM user_sessions WHERE token = $1',
      [token]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    console.error('Oturum silme hatası:', error);
    return false;
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth_token');
    return authCookie?.value || null;
  } catch (error) {
    console.error('Cookie okuma hatası:', error);
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: TOKEN_EXPIRY
    });
  } catch (error) {
    console.error('Cookie ayarlama hatası:', error);
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0
    });
  } catch (error) {
    console.error('Cookie silme hatası:', error);
  }
} 