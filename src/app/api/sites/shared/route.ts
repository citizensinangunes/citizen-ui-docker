import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Verify token and get user ID
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get sites shared with user via team membership (excluding owned sites)
    const sharedSitesQuery = `
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.subdomain, 
        s.status,
        s.language,
        s.created_at,
        s.last_deployed_at,
        u.name as owner_name,
        t.name as team_name,
        f.name as framework_name,
        f.logo_url as framework_logo
      FROM 
        sites s
      LEFT JOIN 
        users u ON s.owner_id = u.id
      LEFT JOIN 
        teams t ON s.team_id = t.id
      LEFT JOIN 
        frameworks f ON s.framework_id = f.id
      WHERE 
        s.owner_id != $1
        AND s.team_id IN (
          SELECT tm.team_id FROM team_members tm WHERE tm.user_id = $1
        )
      ORDER BY 
        s.created_at DESC
    `;

    const { rows: sites } = await pool.query(sharedSitesQuery, [userId]);

    // Format sites objects
    const formattedSites = sites.map(site => ({
      id: site.id,
      name: site.name,
      description: site.description,
      subdomain: site.subdomain,
      status: site.status,
      language: site.language,
      framework: {
        name: site.framework_name,
        logo: site.framework_logo
      },
      owner: site.owner_name,
      team: site.team_name,
      createdAt: site.created_at,
      lastDeployedAt: site.last_deployed_at,
    }));

    return NextResponse.json({ sites: formattedSites });
  } catch (error) {
    console.error('Paylaşılan siteler yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Paylaşılan siteler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 