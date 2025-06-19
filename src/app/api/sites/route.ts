import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Define the webhook event type based on what's in the database schema
type webhook_event_type = 'deploy_start' | 'deploy_success' | 'deploy_fail';

export async function GET(request: NextRequest) {
  try {
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader) {
      token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    }
    
    // If no token in header, try to get from cookie in the request
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

    // Get sites for this user (where owner_id matches or user is in a team that has access)
    const sitesQuery = `
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
        s.owner_id = $1
        OR s.team_id IN (
          SELECT tm.team_id FROM team_members tm WHERE tm.user_id = $1
        )
      ORDER BY 
        s.created_at DESC
    `;

    const { rows: sites } = await pool.query(sitesQuery, [userId]);

    // Formatlanmış site nesnelerini oluştur
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
    console.error('Siteler yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Siteler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[SITE CREATE] Request started');
    
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader) {
      token = authHeader.split(' ')[1];
      console.log('[SITE CREATE] Token obtained from Authorization header');
    }
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        console.log('[SITE CREATE] Checking cookies:', cookieHeader);
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        token = cookies['auth_token'];
        if (token) {
          console.log('[SITE CREATE] Token obtained from cookie');
        } else {
          console.log('[SITE CREATE] No auth_token found in cookies');
        }
      } else {
        console.log('[SITE CREATE] No cookie header found');
      }
    }

    if (!token) {
      console.log('[SITE CREATE] Authentication failed - no token found');
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = await verifyToken(token);
      if (!decoded || !decoded.userId) {
        console.log('[SITE CREATE] Invalid token structure:', decoded);
        return NextResponse.json(
          { error: 'Geçersiz veya süresi dolmuş token' },
          { status: 401 }
        );
      }
      console.log('[SITE CREATE] Token verified, user ID:', decoded.userId);
    } catch (tokenError) {
      console.error('[SITE CREATE] Token verification error:', tokenError);
      return NextResponse.json(
        { error: 'Oturum zaman aşımına uğradı, lütfen tekrar giriş yapın' },
        { status: 401 }
      );
    }
    
    // Get request body
    const reqBody = await request.json();
    console.log('[SITE CREATE] Request body:', JSON.stringify(reqBody, null, 2));
    
    const { name, description, subdomain, framework_id, repo_url, language, team_id, visibility } = reqBody;
    
    // Validate required fields
    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'Site adı ve subdomain alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Check if subdomain is already taken
    try {
      const subdomainCheckResult = await pool.query(
        'SELECT id FROM sites WHERE subdomain = $1',
        [subdomain]
      );
      
      if (subdomainCheckResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Bu subdomain zaten kullanımda' },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error('Subdomain kontrolü sırasında hata:', error);
      return NextResponse.json(
        { error: 'Subdomain kontrolü sırasında bir hata oluştu' },
        { status: 500 }
      );
    }
    
    // Start a transaction
    try {
      await pool.query('BEGIN');
      
      // Doğrudan SQL ile site oluşturuyoruz (fonksiyonlar kullanılabilir değilse)
      const result = await pool.query(
        `INSERT INTO sites (
          name, 
          description, 
          subdomain, 
          status, 
          owner_id,
          team_id,
          framework_id,
          language,
          repository_url,
          branch,
          auto_deploy,
          visibility,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) 
        RETURNING id, site_uuid`,
        [
          name,
          description || '',
          subdomain,
          'active',
          decoded.userId,
          team_id || null,
          framework_id || null,
          language || 'JavaScript',
          repo_url || null,
          'main',
          true,
          visibility || 'public'
        ]
      );
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error('Site oluşturulamadı');
      }
      
      const newSiteId = result.rows[0].id;
      const siteUuid = result.rows[0].site_uuid;
      
      // Site configuration oluştur
      await pool.query(
        `INSERT INTO site_configuration (
          site_id,
          build_command,
          start_command,
          install_command,
          output_directory,
          root_directory,
          node_version,
          auto_deploy,
          https_only,
          environment_variables,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          newSiteId,
          'npm run build',
          'npm start',
          'npm install',
          'dist',
          '/',
          '18.x',
          true,
          true,
          JSON.stringify({})
        ]
      );
      
      // Create default config vars (environment variables)
      await pool.query(
        `INSERT INTO config_vars (
          site_id,
          key,
          value,
          is_sensitive,
          environment,
          created_by,
          created_at,
          updated_at
        ) VALUES 
        ($1, 'NODE_ENV', 'production', FALSE, 'production', $2, NOW(), NOW()),
        ($1, 'API_URL', 'https://api.example.com', FALSE, 'production', $2, NOW(), NOW()),
        ($1, 'DEBUG', 'false', FALSE, 'production', $2, NOW(), NOW())`,
        [newSiteId, decoded.userId]
      );
      
      // Create default domain
      const domainResult = await pool.query(
        `INSERT INTO domains (
          site_id,
          domain_name,
          is_primary,
          verification_status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id`,
        [
          newSiteId,
          `${subdomain}.citizen.company.com`,
          true,
          'verified'
        ]
      );
      
      const domainId = domainResult.rows[0].id;
      
      // Create default SSL certificate for the domain
      await pool.query(
        `INSERT INTO certificates (
          site_id,
          domain_id,
          domain,
          issuer,
          status,
          issue_date,
          expiry_date,
          auto_renew,
          created_at,
          updated_at
        ) VALUES (
          $1,
          $2,
          $3,
          'Let''s Encrypt',
          'pending',
          NOW(),
          NOW() + INTERVAL '90 days',
          TRUE,
          NOW(),
          NOW()
        )`,
        [newSiteId, domainId, `${subdomain}.citizen.company.com`]
      );
      
      // Get user email for notifications
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [decoded.userId]);
      const userEmail = userResult.rows[0].email;
      
      // Set up default email notifications
      await pool.query(
        `INSERT INTO email_notifications (
          site_id,
          event_type,
          recipients,
          enabled,
          created_by,
          created_at,
          updated_at
        ) VALUES 
        ($1, 'deploy_success', $2, TRUE, $3, NOW(), NOW()),
        ($1, 'deploy_fail', $2, TRUE, $3, NOW(), NOW())`,
        [
          newSiteId, 
          JSON.stringify([{"email": userEmail}]),
          decoded.userId
        ]
      );
      
      // Create default webhook for deployment notifications
      await pool.query(
        `INSERT INTO webhooks (
          site_id,
          name,
          url,
          event_types,
          enabled,
          created_by,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          newSiteId,
          'Deployment Notifications',
          'https://example.com/webhook',
          ['deploy_success', 'deploy_fail'] as webhook_event_type[],
          false,  // Disabled by default
          decoded.userId
        ]
      );
      
      // Create initial deployment record
      await pool.query(
        `INSERT INTO deployments (
          site_id,
          user_id,
          status,
          is_production,
          is_auto_deployment,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          newSiteId,
          decoded.userId,
          'queued',  // Initial status
          true,      // Production deployment
          true       // Auto deployment
        ]
      );
      
      // Commit the transaction
      await pool.query('COMMIT');
      
      // Get complete site details
      const newSiteQuery = `
        SELECT 
          s.id, 
          s.name, 
          s.description, 
          s.subdomain, 
          s.status,
          s.language,
          s.created_at,
          s.last_deployed_at,
          s.site_uuid,
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
          s.id = $1
      `;
      
      const { rows } = await pool.query(newSiteQuery, [newSiteId]);
      const site = rows[0];
      
      // Before returning the response
      console.log('[SITE CREATE] Creating response with status 201');
      // This will include the necessary auth cookie
      const response = NextResponse.json({
        message: 'Site başarıyla oluşturuldu',
        site: {
          id: site.id,
          uuid: site.site_uuid,
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
        }
      }, { status: 201 });
      
      // Make sure we preserve the auth cookie
      if (request.cookies.get('auth_token')) {
        console.log('[SITE CREATE] Preserving existing auth_token cookie');
        response.cookies.set({
          name: 'auth_token',
          value: token,
          // Copy the existing cookie settings
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 24 * 60 * 60 // 24 hours
        });
      } else {
        console.log('[SITE CREATE] No existing auth_token cookie to preserve');
      }
      
      console.log('[SITE CREATE] Site created successfully, ID:', newSiteId);
      return response;
      
    } catch (txError) {
      // Roll back the transaction
      try {
        await pool.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Transaction rollback error:', rollbackError);
      }
      
      // Check for specific database errors
      if (txError instanceof Error) {
        const pgError = txError as any;
        
        // Check if it's a PostgreSQL error with a code
        if (pgError.code) {
          // Duplicate key error
          if (pgError.code === '23505') {
            return NextResponse.json(
              { error: 'Bu subdomain zaten kullanımda' },
              { status: 409 }
            );
          }
          
          // Column does not exist
          if (pgError.code === '42703') {
            console.error('Database schema error:', pgError.message);
            return NextResponse.json(
              { error: 'Database şema hatası. Lütfen sistem yöneticisiyle iletişime geçin.' },
              { status: 500 }
            );
          }
        }
      }
      
      // Generic error
      console.error('Site oluşturulurken hata:', txError);
      return NextResponse.json(
        { error: txError instanceof Error ? txError.message : 'Site oluşturulurken bir hata oluştu' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Site oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Site oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 