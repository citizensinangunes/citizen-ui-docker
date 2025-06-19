import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from authorization header or cookie
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { siteName, description, subdomain, framework, language } = await request.json();

    // Validate required fields
    if (!siteName || !subdomain || !framework) {
      return NextResponse.json(
        { error: 'Site name, subdomain, and framework are required' },
        { status: 400 }
      );
    }

    // Check if subdomain is already taken
    const subdomainCheck = await pool.query(
      'SELECT id FROM sites WHERE subdomain = $1',
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 409 }
      );
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create the site
      const siteResult = await pool.query(
        `INSERT INTO sites (
          name,
          description,
          subdomain,
          owner_id,
          framework_id,
          language,
          status,
          visibility,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, site_uuid`,
        [
          siteName,
          description || '',
          subdomain,
          decoded.userId,
          1, // Default framework ID - you might want to map this properly
          language,
          'active',
          'public'
        ]
      );

      const newSiteId = siteResult.rows[0].id;
      const siteUuid = siteResult.rows[0].site_uuid;

      // Create default site configuration
      await pool.query(
        `INSERT INTO site_configuration (
          site_id,
          build_command,
          start_command,
          install_command,
          output_directory,
          node_version,
          auto_deploy,
          https_only,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          newSiteId,
          'npm run build',
          'npm start',
          'npm install',
          'dist',
          '18.x',
          true,
          true
        ]
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

      // Create default SSL certificate
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
          'active',
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

      // Create initial deployment record
      await pool.query(
        `INSERT INTO deployments (
          site_id,
          user_id,
          status,
          commit_message,
          is_production,
          is_auto_deployment,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          newSiteId,
          decoded.userId,
          'success',
          'Initial deployment',
          true,
          false
        ]
      );

      // Commit the transaction
      await pool.query('COMMIT');

      return NextResponse.json({
        message: 'Initial site created successfully',
        site: {
          id: newSiteId,
          uuid: siteUuid,
          name: siteName,
          subdomain: subdomain,
          domain: `${subdomain}.citizen.company.com`
        }
      });

    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating initial site:', error);
    return NextResponse.json(
      { error: 'Failed to create initial site' },
      { status: 500 }
    );
  }
} 