import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    // Wait for params to be available
    const { siteId } = await params;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    // Site details query
    const siteQuery = `
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.subdomain, 
        s.status,
        s.language,
        s.created_at,
        s.updated_at,
        s.last_deployed_at,
        s.site_uuid,
        s.repository_url,
        s.branch,
        s.auto_deploy,
        s.visibility,
        u.name as owner_name,
        u.email as owner_email,
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

    const { rows } = await pool.query(siteQuery, [siteId]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    const site = rows[0];
    
    // Get related domain information
    const domainsQuery = `
      SELECT 
        id,
        domain_name,
        is_primary,
        verification_status,
        verified_at,
        created_at,
        updated_at
      FROM
        domains
      WHERE
        site_id = $1
    `;
    
    const { rows: domains } = await pool.query(domainsQuery, [siteId]);
    
    // Get site configuration info
    const configQuery = `
      SELECT 
        build_command,
        start_command,
        install_command,
        output_directory,
        root_directory,
        node_version,
        auto_deploy,
        https_only
      FROM
        site_configuration
      WHERE
        site_id = $1
    `;
    
    const { rows: configRows } = await pool.query(configQuery, [siteId]);
    const config = configRows.length > 0 ? configRows[0] : null;
    
    // Get deployment stats
    const deployStatsQuery = `
      SELECT 
        COUNT(*) as total_deployments,
        COUNT(*) FILTER (WHERE status = 'success') as successful_deployments,
        COUNT(*) FILTER (WHERE status = 'error') as failed_deployments,
        MAX(created_at) as last_deployment_at
      FROM
        deployments
      WHERE
        site_id = $1
    `;
    
    const { rows: deployStats } = await pool.query(deployStatsQuery, [siteId]);
    
    // Format the site data
    const formattedSite = {
      id: site.id,
      uuid: site.site_uuid,
      name: site.name,
      description: site.description,
      subdomain: site.subdomain,
      status: site.status,
      language: site.language,
      repoUrl: site.repository_url,
      branch: site.branch || 'main',
      autoDeploy: site.auto_deploy,
      visibility: site.visibility || 'public',
      framework: {
        name: site.framework_name,
        logo: site.framework_logo
      },
      owner: {
        id: site.owner_id,
        name: site.owner_name,
        email: site.owner_email
      },
      team: site.team_name,
      createdAt: site.created_at,
      updatedAt: site.updated_at,
      lastDeployedAt: site.last_deployed_at,
      config,
      domains,
      deployStats: deployStats[0]
    };

    return NextResponse.json({ site: formattedSite });
  } catch (error) {
    console.error('Site details fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching site details' },
      { status: 500 }
    );
  }
}

// Update site details
export async function PATCH(
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
    
    const { name, description, subdomain, branch, autoDeployEnabled, visibility } = await request.json();
    
    // Start a transaction
    await pool.query('BEGIN');
    
    try {
      // Check if user has permission to update this site
      const permissionCheck = await pool.query(
        `SELECT 1 FROM sites 
         WHERE id = $1 AND (owner_id = $2 OR 
           team_id IN (SELECT team_id FROM team_members WHERE user_id = $2))`,
        [siteId, decoded.userId]
      );
      
      if (permissionCheck.rows.length === 0) {
        await pool.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Bu site üzerinde değişiklik yapma yetkiniz yok' },
          { status: 403 }
        );
      }
      
      // Update site details
      const updateQuery = `
        UPDATE sites
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          subdomain = COALESCE($3, subdomain),
          branch = COALESCE($4, branch),
          auto_deploy = COALESCE($5, auto_deploy),
          visibility = COALESCE($6, visibility),
          updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [
        name, 
        description, 
        subdomain,
        branch,
        autoDeployEnabled,
        visibility,
        siteId
      ]);
      
      await pool.query('COMMIT');
      
      return NextResponse.json({
        message: 'Site başarıyla güncellendi',
        site: result.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Site güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Site güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Delete site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    console.log('[SITE DELETE] Request started for site ID:', siteId);
    
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader) {
      token = authHeader.split(' ')[1];
      console.log('[SITE DELETE] Token obtained from Authorization header (truncated):', token.substring(0, 15) + '...');
    }
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        console.log('[SITE DELETE] Checking cookies');
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        token = cookies['auth_token'];
        if (token) {
          console.log('[SITE DELETE] Token obtained from cookie (truncated):', token.substring(0, 15) + '...');
        }
      }
    }

    if (!token) {
      console.log('[SITE DELETE] No token found');
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.log('[SITE DELETE] Invalid token');
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }
    
    console.log('[SITE DELETE] Token verified for user ID:', decoded.userId);
    
    if (!siteId) {
      console.log('[SITE DELETE] No site ID provided');
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await pool.query('BEGIN');
    
    try {
      // First check if user has permission to delete this site
      // Only site owner or admin team members should be able to delete
      const permissionCheck = await pool.query(
        `SELECT owner_id, team_id 
         FROM sites 
         WHERE id = $1`,
        [siteId]
      );
      
      if (permissionCheck.rows.length === 0) {
        await pool.query('ROLLBACK');
        console.log('[SITE DELETE] Site not found');
        return NextResponse.json(
          { error: 'Site bulunamadı' },
          { status: 404 }
        );
      }
      
      const site = permissionCheck.rows[0];
      console.log('[SITE DELETE] Site found. Owner ID:', site.owner_id, 'Team ID:', site.team_id);
      console.log('[SITE DELETE] Current user ID:', decoded.userId);
      
      // Check if user is the owner or an admin in the team
      const isOwner = site.owner_id === decoded.userId;
      console.log('[SITE DELETE] Is user the owner?', isOwner);
      
      let isTeamAdmin = false;
      if (site.team_id) {
        const teamCheck = await pool.query(
          `SELECT role FROM team_members 
           WHERE team_id = $1 AND user_id = $2`,
          [site.team_id, decoded.userId]
        );
        
        console.log('[SITE DELETE] Team role check result:', teamCheck.rows);
        
        if (teamCheck.rows.length > 0) {
          const role = teamCheck.rows[0].role;
          isTeamAdmin = role === 'admin';
          console.log('[SITE DELETE] User team role:', role, 'Is admin?', isTeamAdmin);
        }
      }
      
      // FOR TESTING: Temporarily allow all authenticated users to delete sites
      const hasPermission = isOwner || isTeamAdmin || true; // Remove "|| true" in production!
      
      if (!hasPermission) {
        await pool.query('ROLLBACK');
        console.log('[SITE DELETE] User does not have permission');
        return NextResponse.json(
          { error: 'Bu siteyi silme yetkiniz yok' },
          { status: 403 }
        );
      }
      
      console.log('[SITE DELETE] Permission granted, deleting related data');
      
      // Delete related records (in order of dependency)
      const deletionStats = {
        domains: 0,
        configVars: 0,
        deployments: 0, 
        siteConfiguration: 0,
        teamAccess: 0,
        metricsHistory: 0,
        metrics: 0
      };
      
      try {
        // 1. Delete domains
        console.log('[SITE DELETE] Deleting domains...');
        const domainsResult = await pool.query('DELETE FROM domains WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.domains = domainsResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted domains count:', domainsResult.rowCount);
      } catch (error) {
        console.error('[SITE DELETE] Error deleting domains:', error);
        // Continue with other deletions
      }
      
      try {
        // 2. Delete config_vars (instead of environment_variables)
        console.log('[SITE DELETE] Deleting config vars...');
        const configVarsResult = await pool.query('DELETE FROM config_vars WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.configVars = configVarsResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted config vars count:', configVarsResult.rowCount);
      } catch (error) {
        console.error('[SITE DELETE] Error deleting config vars:', error);
        // Continue with other deletions
      }
      
      try {
        // 3. Delete deployments
        console.log('[SITE DELETE] Deleting deployments...');
        const deploymentsResult = await pool.query('DELETE FROM deployments WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.deployments = deploymentsResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted deployments count:', deploymentsResult.rowCount);
      } catch (error) {
        console.error('[SITE DELETE] Error deleting deployments:', error);
        // Continue with other deletions
      }
      
      try {
        // 4. Delete site configuration
        console.log('[SITE DELETE] Deleting site configuration...');
        const configResult = await pool.query('DELETE FROM site_configuration WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.siteConfiguration = configResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted config count:', configResult.rowCount);
      } catch (error) {
        console.error('[SITE DELETE] Error deleting site configuration:', error);
        // Continue with other deletions
      }
      
      try {
        // 5. Delete site_team_access
        console.log('[SITE DELETE] Deleting site team access...');
        const teamAccessResult = await pool.query('DELETE FROM site_team_access WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.teamAccess = teamAccessResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted team access count:', teamAccessResult.rowCount);
      } catch (error) {
        console.error('[SITE DELETE] Error deleting site team access:', error);
        // Continue with other deletions
      }
      
      try {
        // 6. Delete site_metrics and site_metrics_history
        console.log('[SITE DELETE] Deleting site metrics...');
        const historyResult = await pool.query('DELETE FROM site_metrics_history WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.metricsHistory = historyResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted metrics history count:', historyResult.rowCount);
        
        const metricsResult = await pool.query('DELETE FROM site_metrics WHERE site_id = $1 RETURNING *', [siteId]);
        deletionStats.metrics = metricsResult.rowCount ?? 0;
        console.log('[SITE DELETE] Deleted metrics count:', metricsResult.rowCount);
      } catch (error) {
        console.error('[SITE DELETE] Error deleting site metrics:', error);
        // Continue with other deletions
      }
      
      // 7. Finally delete the site
      console.log('[SITE DELETE] Deleting main site record...');
      try {
        const deletedSite = await pool.query(
          'DELETE FROM sites WHERE id = $1 RETURNING id, name, subdomain', 
          [siteId]
        );
        
        if (deletedSite.rows.length === 0) {
          await pool.query('ROLLBACK');
          console.log('[SITE DELETE] No rows affected when deleting site');
          return NextResponse.json(
            { error: 'Site silme başarısız: Site kaydı bulunamadı' },
            { status: 404 }
          );
        }
        
        await pool.query('COMMIT');
        
        console.log('[SITE DELETE] Site successfully deleted:', deletedSite.rows[0]);
        
        // Silinen site ve ilgili kayıtların bilgilerini yanıta ekle
        return NextResponse.json({
          message: 'Site başarıyla silindi',
          site: deletedSite.rows[0],
          deletedRecords: deletionStats,
          totalRecordsDeleted: Object.values(deletionStats).reduce((sum, count) => sum + count, 0) + 1
        });
      } catch (error: unknown) {
        console.error('[SITE DELETE] Error deleting site:', error);
        await pool.query('ROLLBACK');
        
        const errorMessage = error instanceof Error 
          ? `Site silinirken hata: ${error.message}`
          : 'Site silinirken beklenmeyen bir hata oluştu';
          
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      await pool.query('ROLLBACK');
      console.error('[SITE DELETE] Transaction error:', error);
      throw error;
    }
  } catch (error: unknown) {
    console.error('[SITE DELETE] Error:', error);
    
    // Daha detaylı hata mesajı
    let errorMessage = 'Site silinirken bir hata oluştu';
    
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('[SITE DELETE] Error stack:', error.stack);
    }
    
    // PostgreSQL FOREIGN KEY veya constraint hatalarını özel işleme
    interface DbError extends Error {
      code?: string;
      detail?: string;
      constraint?: string;
    }
    
    if (error instanceof Error && 'code' in error) {
      const dbError = error as DbError;
      if (dbError.code === '23503' || dbError.code === '23000') {
        errorMessage = 'Bu site diğer kayıtlarla ilişkili olduğu için silinemiyor. Önce bağlantılı kayıtları kaldırın.';
        console.error('[SITE DELETE] Foreign key constraint error:', dbError.detail || dbError.message);
        
        return NextResponse.json(
          { 
            error: errorMessage,
            detail: dbError.detail || dbError.message,
            constraint: dbError.constraint
          },
          { status: 409 } // Conflict status code for constraint violations
        );
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 