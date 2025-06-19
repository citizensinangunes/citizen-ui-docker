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
    
    // Fetch all certificates for this site
    const certificatesQuery = `
      SELECT 
        c.id,
        c.domain,
        c.issuer,
        c.status,
        c.certificate_data,
        c.issue_date,
        c.expiry_date,
        c.auto_renew,
        c.last_renewal_attempt,
        c.renewal_attempts,
        c.created_at,
        c.updated_at,
        d.domain_name
      FROM 
        certificates c
      LEFT JOIN
        domains d ON c.domain_id = d.id
      WHERE 
        c.site_id = $1
      ORDER BY
        c.created_at DESC
    `;
    
    const { rows } = await pool.query(certificatesQuery, [siteId]);
    
    return NextResponse.json({
      certificates: rows.map(cert => ({
        id: cert.id,
        domain: cert.domain,
        domainName: cert.domain_name,
        issuer: cert.issuer,
        status: cert.status,
        certificateData: cert.certificate_data,
        issueDate: cert.issue_date,
        expiryDate: cert.expiry_date,
        autoRenew: cert.auto_renew,
        lastRenewalAttempt: cert.last_renewal_attempt,
        renewalAttempts: cert.renewal_attempts,
        createdAt: cert.created_at,
        updatedAt: cert.updated_at
      }))
    });
  } catch (error) {
    console.error('SSL sertifikaları yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'SSL sertifikaları yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Create a new certificate
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
    
    const { domainId, domain, autoRenew = true } = await request.json();
    
    if (!domainId && !domain) {
      return NextResponse.json(
        { error: 'Sertifika için domain bilgisi gerekli' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await pool.query('BEGIN');
    
    try {
      // Determine the domain
      let selectedDomainId = domainId;
      let selectedDomain = domain;
      
      if (!selectedDomainId && selectedDomain) {
        // Check if the domain exists in the domains table
        const domainQuery = `
          SELECT id, domain_name 
          FROM domains 
          WHERE site_id = $1 AND domain_name = $2
        `;
        
        const { rows: domainRows } = await pool.query(domainQuery, [siteId, selectedDomain]);
        
        if (domainRows.length > 0) {
          selectedDomainId = domainRows[0].id;
        } else {
          // Create a new domain entry
          const createDomainQuery = `
            INSERT INTO domains (
              site_id,
              domain_name,
              is_primary,
              verification_status,
              created_at,
              updated_at
            )
            VALUES ($1, $2, FALSE, 'pending', NOW(), NOW())
            RETURNING id
          `;
          
          const { rows: newDomainRows } = await pool.query(createDomainQuery, [siteId, selectedDomain]);
          selectedDomainId = newDomainRows[0].id;
        }
      } else if (selectedDomainId && !selectedDomain) {
        // Get the domain name for the provided ID
        const domainQuery = `SELECT domain_name FROM domains WHERE id = $1 AND site_id = $2`;
        const { rows: domainRows } = await pool.query(domainQuery, [selectedDomainId, siteId]);
        
        if (domainRows.length === 0) {
          await pool.query('ROLLBACK');
          return NextResponse.json(
            { error: 'Belirtilen domain bulunamadı' },
            { status: 404 }
          );
        }
        
        selectedDomain = domainRows[0].domain_name;
      }
      
      // Check if a certificate already exists for this domain
      const existingCertQuery = `
        SELECT id FROM certificates 
        WHERE site_id = $1 AND domain_id = $2
      `;
      
      const { rows: existingCert } = await pool.query(existingCertQuery, [siteId, selectedDomainId]);
      
      if (existingCert.length > 0) {
        await pool.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Bu domain için zaten bir sertifika bulunuyor' },
          { status: 409 }
        );
      }
      
      // Create the certificate
      const createCertQuery = `
        INSERT INTO certificates (
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
        )
        VALUES (
          $1,
          $2,
          $3,
          'Let''s Encrypt',
          'pending',
          NOW(),
          NOW() + INTERVAL '90 days',
          $4,
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      
      const { rows } = await pool.query(createCertQuery, [
        siteId,
        selectedDomainId,
        selectedDomain,
        autoRenew
      ]);
      
      await pool.query('COMMIT');
      
      // TODO: Trigger the actual certificate issuance process
      // This would typically involve a webhook or background job
      
      return NextResponse.json({
        message: 'SSL sertifikası başarıyla talep edildi',
        certificate: {
          id: rows[0].id,
          domain: rows[0].domain,
          status: rows[0].status,
          issuer: rows[0].issuer,
          autoRenew: rows[0].auto_renew,
          issueDate: rows[0].issue_date,
          expiryDate: rows[0].expiry_date,
          createdAt: rows[0].created_at
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('SSL sertifikası oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'SSL sertifikası oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Delete a certificate
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
    const certificateId = url.searchParams.get('certificateId');
    
    if (!certificateId) {
      return NextResponse.json(
        { error: 'Silinecek sertifika ID değeri eksik' },
        { status: 400 }
      );
    }
    
    // Check if the certificate exists and belongs to the site
    const certCheckQuery = `
      SELECT id FROM certificates 
      WHERE id = $1 AND site_id = $2
    `;
    
    const { rows: certCheck } = await pool.query(certCheckQuery, [certificateId, siteId]);
    
    if (certCheck.length === 0) {
      return NextResponse.json(
        { error: 'Belirtilen sertifika bulunamadı' },
        { status: 404 }
      );
    }
    
    // Delete the certificate
    const deleteCertQuery = `
      DELETE FROM certificates 
      WHERE id = $1 
      RETURNING id, domain
    `;
    
    const { rows } = await pool.query(deleteCertQuery, [certificateId]);
    
    return NextResponse.json({
      message: 'SSL sertifikası başarıyla silindi',
      certificate: {
        id: rows[0].id,
        domain: rows[0].domain
      }
    });
  } catch (error) {
    console.error('SSL sertifikası silinirken hata:', error);
    return NextResponse.json(
      { error: 'SSL sertifikası silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 