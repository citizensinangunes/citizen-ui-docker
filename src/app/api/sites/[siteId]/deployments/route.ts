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
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Get deployments for this site
    const deploymentsQuery = `
      SELECT 
        d.id, 
        d.status,
        d.commit_hash,
        d.commit_message,
        d.branch,
        d.created_at,
        d.started_at,
        d.finished_at,
        d.deployed_at,
        d.build_time,
        d.error_message,
        d.is_production,
        d.is_auto_deployment,
        d.is_rollback,
        d.rollback_from_id,
        d.deployment_url,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM 
        deployments d
      LEFT JOIN 
        users u ON d.user_id = u.id
      WHERE 
        d.site_id = $1
      ORDER BY 
        d.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const { rows: deployments } = await pool.query(deploymentsQuery, [siteId, limit, offset]);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM deployments
      WHERE site_id = $1
    `;
    
    const { rows: countResult } = await pool.query(countQuery, [siteId]);
    const total = parseInt(countResult[0].total);
    
    return NextResponse.json({
      deployments: deployments.map(d => ({
        id: d.id,
        status: d.status,
        commitHash: d.commit_hash,
        commitMessage: d.commit_message,
        branch: d.branch,
        createdAt: d.created_at,
        startedAt: d.started_at,
        finishedAt: d.finished_at,
        deployedAt: d.deployed_at,
        buildTime: d.build_time,
        errorMessage: d.error_message,
        isProduction: d.is_production,
        isAutoDeployment: d.is_auto_deployment,
        isRollback: d.is_rollback,
        rollbackFromId: d.rollback_from_id,
        deploymentUrl: d.deployment_url,
        user: {
          name: d.user_name,
          avatar: d.user_avatar
        }
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Deployments yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Deployments yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Trigger a new deployment
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
    
    const { commitMessage, branch, isProduction = true } = await request.json();
    
    // Check if the site exists and user has permission
    const siteCheckQuery = `
      SELECT * FROM sites 
      WHERE id = $1 AND (owner_id = $2 OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = $2))
    `;
    
    const { rows: siteCheck } = await pool.query(siteCheckQuery, [siteId, decoded.userId]);
    
    if (siteCheck.length === 0) {
      return NextResponse.json(
        { error: 'Site bulunamadı veya erişim yetkiniz yok' },
        { status: 404 }
      );
    }
    
    // Create a new deployment
    const createDeploymentQuery = `
      INSERT INTO deployments (
        site_id,
        user_id,
        status,
        commit_message,
        branch,
        is_production,
        is_auto_deployment,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const { rows } = await pool.query(createDeploymentQuery, [
      siteId,
      decoded.userId,
      'queued',
      commitMessage || 'Manual deployment',
      branch || siteCheck[0].branch || 'main',
      isProduction,
      false // not auto deployment (manual)
    ]);
    
    const deployment = rows[0];
    
    // TODO: Trigger the actual deployment process here
    // This would typically involve calling a background job or webhook
    
    return NextResponse.json({
      message: 'Deployment başarıyla başlatıldı',
      deployment: {
        id: deployment.id,
        status: deployment.status,
        commitMessage: deployment.commit_message,
        branch: deployment.branch,
        isProduction: deployment.is_production,
        createdAt: deployment.created_at
      }
    });
  } catch (error) {
    console.error('Deployment başlatılırken hata:', error);
    return NextResponse.json(
      { error: 'Deployment başlatılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 