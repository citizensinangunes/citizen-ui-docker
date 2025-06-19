import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
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
    
    // Config vars query
    const configVarsQuery = `
      SELECT 
        id,
        key,
        value,
        is_sensitive,
        environment,
        created_by,
        created_at,
        updated_at
      FROM 
        config_vars
      WHERE 
        site_id = $1
      ORDER BY
        key ASC
    `;
    
    const { rows } = await pool.query(configVarsQuery, [siteId]);
    
    return NextResponse.json({
      configVars: rows.map(row => ({
        id: row.id,
        key: row.key,
        value: row.value,
        isSensitive: row.is_sensitive,
        environment: row.environment,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Config variables yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Config variables yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        token = cookies['auth_token'];
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }
    
    const { siteId } = await params;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    const { key, value, isSensitive = false, environment = 'production' } = await request.json();
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key ve value alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Check if the key already exists for this site
    const checkExistingQuery = `
      SELECT id FROM config_vars 
      WHERE site_id = $1 AND key = $2 AND environment = $3
    `;
    const checkResult = await pool.query(checkExistingQuery, [siteId, key, environment]);
    
    let result;
    
    if (checkResult.rows.length > 0) {
      // Update existing config var
      const updateQuery = `
        UPDATE config_vars
        SET 
          value = $1,
          is_sensitive = $2,
          updated_by = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      result = await pool.query(updateQuery, [
        value,
        isSensitive,
        decoded.userId,
        checkResult.rows[0].id
      ]);
    } else {
      // Insert new config var
      const insertQuery = `
        INSERT INTO config_vars (
          site_id,
          key,
          value,
          is_sensitive,
          environment,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      
      result = await pool.query(insertQuery, [
        siteId,
        key,
        value,
        isSensitive,
        environment,
        decoded.userId
      ]);
    }
    
    const configVar = result.rows[0];
    
    return NextResponse.json({
      message: 'Config variable başarıyla kaydedildi',
      configVar: {
        id: configVar.id,
        key: configVar.key,
        value: configVar.value,
        isSensitive: configVar.is_sensitive,
        environment: configVar.environment,
        createdBy: configVar.created_by,
        createdAt: configVar.created_at,
        updatedAt: configVar.updated_at
      }
    });
  } catch (error) {
    console.error('Config variable kaydedilirken hata:', error);
    return NextResponse.json(
      { error: 'Config variable kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        token = cookies['auth_token'];
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }
    
    const { siteId } = await params;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'Silinecek config variable key değeri belirtilmelidir' },
        { status: 400 }
      );
    }
    
    // Check if the key exists for this site
    const checkExistingQuery = `
      SELECT id FROM config_vars 
      WHERE site_id = $1 AND key = $2
    `;
    const checkResult = await pool.query(checkExistingQuery, [siteId, key]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Belirtilen config variable bulunamadı' },
        { status: 404 }
      );
    }
    
    // Delete the config var
    const deleteQuery = `
      DELETE FROM config_vars 
      WHERE id = $1
      RETURNING id, key
    `;
    
    const result = await pool.query(deleteQuery, [checkResult.rows[0].id]);
    
    return NextResponse.json({
      message: 'Config variable başarıyla silindi',
      deleted: {
        id: result.rows[0].id,
        key: result.rows[0].key
      }
    });
  } catch (error) {
    console.error('Config variable silinirken hata:', error);
    return NextResponse.json(
      { error: 'Config variable silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 