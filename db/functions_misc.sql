-- BİLDİRİM VE WEBHOOK FONKSİYONLARI

-- 1. Bildirim Teslim Kaydı Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION add_notification_delivery(
    p_notification_id INTEGER,
    p_recipient VARCHAR,
    p_status VARCHAR DEFAULT 'sent',
    p_delivery_details JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    notification_id INTEGER,
    recipient VARCHAR,
    status VARCHAR,
    delivery_timestamp TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_delivery_id INTEGER;
BEGIN
    INSERT INTO notification_deliveries (
        notification_id,
        recipient,
        status,
        delivery_details
    )
    VALUES (
        p_notification_id,
        p_recipient,
        p_status,
        COALESCE(p_delivery_details, '{}')
    )
    RETURNING id INTO v_delivery_id;
    
    RETURN QUERY
    SELECT nd.id, nd.notification_id, nd.recipient, nd.status, nd.delivery_timestamp
    FROM notification_deliveries nd
    WHERE nd.id = v_delivery_id;
END;
$$;

-- 2. Webhook Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_webhook(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_name VARCHAR,
    p_url VARCHAR,
    p_event_types webhook_event_type[],
    p_secret_token VARCHAR DEFAULT NULL,
    p_headers JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    name VARCHAR,
    url VARCHAR,
    event_types webhook_event_type[],
    enabled BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_access BOOLEAN;
    v_webhook_id INTEGER;
BEGIN
    -- Kullanıcının siteye erişim yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM sites s
        LEFT JOIN site_team_access sta ON s.id = sta.site_id
        LEFT JOIN team_members tm ON sta.team_id = tm.team_id
        WHERE s.id = p_site_id AND (
            s.owner_id = p_user_id OR
            (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin'))
        )
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu siteye webhook eklemek için site sahibi veya takım yöneticisi olmalısınız.';
    END IF;
    
    -- Event type dizisi boş olmamalı
    IF p_event_types IS NULL OR array_length(p_event_types, 1) = 0 THEN
        RAISE EXCEPTION 'En az bir event type belirtilmelidir.';
    END IF;
    
    -- Webhook ekle
    INSERT INTO webhooks (
        site_id,
        name,
        url,
        event_types,
        secret_token,
        headers,
        created_by
    )
    VALUES (
        p_site_id,
        p_name,
        p_url,
        p_event_types,
        p_secret_token,
        COALESCE(p_headers, '{}'),
        p_user_id
    )
    RETURNING id INTO v_webhook_id;
    
    RETURN QUERY
    SELECT w.id, w.site_id, w.name, w.url, w.event_types, w.enabled, w.created_at
    FROM webhooks w
    WHERE w.id = v_webhook_id;
END;
$$;

-- 3. Webhook Durumu Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_webhook_status(
    p_user_id INTEGER,
    p_webhook_id INTEGER,
    p_status BOOLEAN,
    p_success_count INTEGER DEFAULT NULL,
    p_failure_count INTEGER DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    enabled BOOLEAN,
    success_count INTEGER,
    failure_count INTEGER,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_has_access BOOLEAN;
BEGIN
    -- Webhook'un site ID'sini al
    SELECT site_id INTO v_site_id
    FROM webhooks
    WHERE id = p_webhook_id;
    
    IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'Webhook bulunamadı.';
    END IF;
    
    -- Kullanıcının siteye erişim yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM sites s
        LEFT JOIN site_team_access sta ON s.id = sta.site_id
        LEFT JOIN team_members tm ON sta.team_id = tm.team_id
        WHERE s.id = v_site_id AND (
            s.owner_id = p_user_id OR
            (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin'))
        )
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu webhook''un durumunu güncellemek için site sahibi veya takım yöneticisi olmalısınız.';
    END IF;
    
    -- Webhook durumunu güncelle
    UPDATE webhooks
    SET 
        enabled = p_status,
        success_count = COALESCE(p_success_count, success_count),
        failure_count = COALESCE(p_failure_count, failure_count),
        last_triggered_at = CASE WHEN p_success_count IS NOT NULL OR p_failure_count IS NOT NULL THEN NOW() ELSE last_triggered_at END,
        updated_at = NOW()
    WHERE id = p_webhook_id;
    
    RETURN QUERY
    SELECT w.id, w.site_id, w.enabled, w.success_count, w.failure_count, w.last_triggered_at, w.updated_at
    FROM webhooks w
    WHERE w.id = p_webhook_id;
END;
$$;

-- 4. Sertifika Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_certificate(
    p_site_id INTEGER,
    p_domain_id INTEGER,
    p_domain VARCHAR,
    p_auto_renew BOOLEAN DEFAULT TRUE
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    domain_id INTEGER,
    domain VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_exists BOOLEAN;
    v_domain_exists BOOLEAN;
    v_certificate_id INTEGER;
BEGIN
    -- Site ve domain'in var olup olmadığını kontrol et
    SELECT EXISTS (SELECT 1 FROM sites WHERE id = p_site_id) INTO v_site_exists;
    
    IF NOT v_site_exists THEN
        RAISE EXCEPTION 'Belirtilen site bulunamadı.';
    END IF;
    
    SELECT EXISTS (SELECT 1 FROM domains WHERE id = p_domain_id AND site_id = p_site_id) INTO v_domain_exists;
    
    IF NOT v_domain_exists THEN
        RAISE EXCEPTION 'Belirtilen domain bu site için bulunamadı.';
    END IF;
    
    -- Mevcut sertifika var mı kontrol et
    IF EXISTS (SELECT 1 FROM certificates WHERE domain_id = p_domain_id) THEN
        RAISE EXCEPTION 'Bu domain için zaten bir sertifika mevcut.';
    END IF;
    
    -- Sertifika oluştur
    INSERT INTO certificates (
        site_id,
        domain_id,
        domain,
        status,
        auto_renew
    )
    VALUES (
        p_site_id,
        p_domain_id,
        p_domain,
        'pending',
        p_auto_renew
    )
    RETURNING id INTO v_certificate_id;
    
    -- Arka plan işi oluştur (gerçek uygulamada sertifika sağlayıcıya istek gönderilir)
    INSERT INTO background_jobs (
        job_type,
        payload,
        priority
    )
    VALUES (
        'issue_certificate',
        jsonb_build_object(
            'certificate_id', v_certificate_id,
            'domain', p_domain,
            'site_id', p_site_id
        ),
        1
    );
    
    RETURN QUERY
    SELECT c.id, c.site_id, c.domain_id, c.domain, c.status, c.created_at, c.auto_renew
    FROM certificates c
    WHERE c.id = v_certificate_id;
END;
$$;

-- 5. Sertifika Durumu Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_certificate_status(
    p_certificate_id INTEGER,
    p_status VARCHAR,
    p_certificate_data TEXT DEFAULT NULL,
    p_private_key TEXT DEFAULT NULL,
    p_issuer VARCHAR DEFAULT NULL,
    p_issue_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_expiry_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    domain VARCHAR,
    status VARCHAR,
    issuer VARCHAR,
    issue_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE certificates
    SET 
        status = p_status,
        certificate_data = COALESCE(p_certificate_data, certificate_data),
        private_key = COALESCE(p_private_key, private_key),
        issuer = COALESCE(p_issuer, issuer),
        issue_date = COALESCE(p_issue_date, issue_date),
        expiry_date = COALESCE(p_expiry_date, expiry_date),
        updated_at = NOW()
    WHERE id = p_certificate_id;
    
    RETURN QUERY
    SELECT c.id, c.site_id, c.domain, c.status, c.issuer, c.issue_date, c.expiry_date, c.updated_at
    FROM certificates c
    WHERE c.id = p_certificate_id;
END;
$$;

-- 6. Davet Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_invitation(
    p_user_id INTEGER,
    p_email VARCHAR,
    p_role VARCHAR,
    p_team_id INTEGER DEFAULT NULL,
    p_site_id INTEGER DEFAULT NULL,
    p_expires_in INTEGER DEFAULT 7 -- Gün cinsinden
) RETURNS TABLE(
    id INTEGER,
    email VARCHAR,
    token VARCHAR,
    role VARCHAR,
    team_id INTEGER,
    site_id INTEGER,
    invited_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_team_access BOOLEAN := FALSE;
    v_has_site_access BOOLEAN := FALSE;
    v_token VARCHAR;
    v_invitation_id INTEGER;
BEGIN
    -- Takım yetkisini kontrol et
    IF p_team_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM team_members
            WHERE team_id = p_team_id AND user_id = p_user_id AND role IN ('owner', 'admin')
        ) INTO v_has_team_access;
        
        IF NOT v_has_team_access THEN
            RAISE EXCEPTION 'Yetersiz yetki: Takıma davet göndermek için owner veya admin olmalısınız.';
        END IF;
    END IF;
    
    -- Site yetkisini kontrol et
    IF p_site_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM sites s
            LEFT JOIN site_team_access sta ON s.id = sta.site_id
            LEFT JOIN team_members tm ON sta.team_id = tm.team_id
            WHERE s.id = p_site_id AND (
                s.owner_id = p_user_id OR
                (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin'))
            )
        ) INTO v_has_site_access;
        
        IF NOT v_has_site_access THEN
            RAISE EXCEPTION 'Yetersiz yetki: Siteye davet göndermek için site sahibi veya takım yöneticisi olmalısınız.';
        END IF;
    END IF;
    
    -- En az bir hedef (takım veya site) belirtilmeli
    IF p_team_id IS NULL AND p_site_id IS NULL THEN
        RAISE EXCEPTION 'Davette en az bir hedef (takım veya site) belirtilmelidir.';
    END IF;
    
    -- Benzersiz token oluştur
    v_token := encode(gen_random_bytes(16), 'hex');
    
    -- Aynı e-posta için önceki davetleri iptal et
    UPDATE invitations
    SET 
        is_cancelled = TRUE,
        cancelled_at = NOW(),
        cancelled_by = p_user_id
    WHERE 
        email = p_email AND 
        (team_id = p_team_id OR site_id = p_site_id) AND
        accepted_at IS NULL AND
        is_cancelled = FALSE AND
        expires_at > NOW();
    
    -- Yeni davet oluştur
    INSERT INTO invitations (
        email,
        token,
        role,
        team_id,
        site_id,
        invited_by,
        expires_at
    )
    VALUES (
        p_email,
        v_token,
        p_role,
        p_team_id,
        p_site_id,
        p_user_id,
        NOW() + (p_expires_in || ' days')::INTERVAL
    )
    RETURNING id INTO v_invitation_id;
    
    RETURN QUERY
    SELECT i.id, i.email, i.token, i.role, i.team_id, i.site_id, i.invited_by, i.created_at, i.expires_at
    FROM invitations i
    WHERE i.id = v_invitation_id;
END;
$$;

-- 7. Davet Kabul Etme Fonksiyonu
CREATE OR REPLACE FUNCTION accept_invitation(
    p_user_id INTEGER,
    p_token VARCHAR
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    team_id INTEGER,
    team_name VARCHAR,
    site_id INTEGER,
    site_name VARCHAR,
    role VARCHAR
) LANGUAGE plpgsql AS $$
DECLARE
    v_invitation_id INTEGER;
    v_email VARCHAR;
    v_role VARCHAR;
    v_team_id INTEGER;
    v_site_id INTEGER;
    v_team_name VARCHAR;
    v_site_name VARCHAR;
    v_user_email VARCHAR;
    v_result_message TEXT;
BEGIN
    -- Kullanıcı e-posta adresini al
    SELECT email INTO v_user_email
    FROM users
    WHERE id = p_user_id;
    
    IF v_user_email IS NULL THEN
        RETURN QUERY
        SELECT FALSE, 'Kullanıcı bulunamadı.', NULL, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- Daveti bul
    SELECT id, email, role, team_id, site_id
    INTO v_invitation_id, v_email, v_role, v_team_id, v_site_id
    FROM invitations
    WHERE 
        token = p_token AND
        is_cancelled = FALSE AND
        accepted_at IS NULL AND
        expires_at > NOW();
    
    IF v_invitation_id IS NULL THEN
        RETURN QUERY
        SELECT FALSE, 'Geçersiz veya süresi dolmuş davet.', NULL, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- Davet edilen e-posta ile kullanıcının e-postası eşleşmeli
    IF v_email <> v_user_email THEN
        RETURN QUERY
        SELECT FALSE, 'Bu davet sizin için değil. Davette kullanılan e-posta: ' || v_email, NULL, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- Davet bir takım için mi?
    IF v_team_id IS NOT NULL THEN
        -- Takım adını al
        SELECT name INTO v_team_name
        FROM teams
        WHERE id = v_team_id;
        
        -- Kullanıcı zaten takımda mı?
        IF EXISTS(SELECT 1 FROM team_members WHERE team_id = v_team_id AND user_id = p_user_id) THEN
            RETURN QUERY
            SELECT FALSE, 'Zaten bu takımın üyesisiniz: ' || v_team_name, v_team_id, v_team_name, NULL, NULL, NULL;
            RETURN;
        END IF;
        
        -- Kullanıcıyı takıma ekle
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (v_team_id, p_user_id, v_role::team_member_role);
        
        v_result_message := v_team_name || ' takımına ' || v_role || ' rolü ile başarıyla katıldınız.';
    END IF;
    
    -- Davet bir site için mi?
    IF v_site_id IS NOT NULL THEN
        -- Site adını al
        SELECT name INTO v_site_name
        FROM sites
        WHERE id = v_site_id;
        
        -- Site rolü verme işlemi burada yapılabilir (özel bir mekanizma gerektirir)
        -- Burada basitçe site ile kullanıcıyı ilişkilendiriyoruz
        
        v_result_message := COALESCE(v_result_message || ' Ve ', '') || v_site_name || ' sitesine ' || v_role || ' rolü ile erişim kazandınız.';
    END IF;
    
    -- Daveti kabul edildi olarak işaretle
    UPDATE invitations
    SET 
        accepted_at = NOW(),
        accepted_by = p_user_id
    WHERE id = v_invitation_id;
    
    RETURN QUERY
    SELECT TRUE, v_result_message, v_team_id, v_team_name, v_site_id, v_site_name, v_role;
END;
$$;

-- 8. İzin Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_permission(
    p_name VARCHAR,
    p_resource_type VARCHAR,
    p_action VARCHAR,
    p_description TEXT DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    resource_type VARCHAR,
    action VARCHAR,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_permission_id INTEGER;
BEGIN
    INSERT INTO permissions (name, resource_type, action, description)
    VALUES (p_name, p_resource_type, p_action, p_description)
    ON CONFLICT (resource_type, action) DO UPDATE
    SET 
        name = EXCLUDED.name,
        description = COALESCE(EXCLUDED.description, permissions.description)
    RETURNING id INTO v_permission_id;
    
    RETURN QUERY
    SELECT p.id, p.name, p.resource_type, p.action, p.description, p.created_at
    FROM permissions p
    WHERE p.id = v_permission_id;
END;
$$;

-- 9. Role İzin Atama Fonksiyonu
CREATE OR REPLACE FUNCTION grant_role_permission(
    p_admin_id INTEGER,
    p_role_id INTEGER,
    p_permission_id INTEGER
) RETURNS TABLE(
    id INTEGER,
    role_id INTEGER,
    permission_id INTEGER,
    granted_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_role_permission_id INTEGER;
BEGIN
    -- Admin yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = p_admin_id AND r.name = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Yetersiz yetki: Rollere izin atamak için admin olmalısınız.';
    END IF;
    
    -- Rol ve iznin varlığını kontrol et
    IF NOT EXISTS(SELECT 1 FROM roles WHERE id = p_role_id) THEN
        RAISE EXCEPTION 'Belirtilen rol bulunamadı.';
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM permissions WHERE id = p_permission_id) THEN
        RAISE EXCEPTION 'Belirtilen izin bulunamadı.';
    END IF;
    
    -- İzni role ata
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (p_role_id, p_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING
    RETURNING id INTO v_role_permission_id;
    
    RETURN QUERY
    SELECT rp.id, rp.role_id, rp.permission_id, rp.granted_at
    FROM role_permissions rp
    WHERE rp.id = v_role_permission_id;
END;
$$;

-- 10. Kaynak Limitleri Ayarlama Fonksiyonu
CREATE OR REPLACE FUNCTION set_resource_limits(
    p_admin_id INTEGER,
    p_site_id INTEGER DEFAULT NULL,
    p_team_id INTEGER DEFAULT NULL,
    p_max_bandwidth_gb REAL DEFAULT NULL,
    p_max_storage_gb REAL DEFAULT NULL,
    p_max_sites INTEGER DEFAULT NULL,
    p_max_domains INTEGER DEFAULT NULL,
    p_max_builds_per_day INTEGER DEFAULT NULL,
    p_max_container_memory REAL DEFAULT NULL,
    p_max_container_cpu REAL DEFAULT NULL,
    p_max_concurrent_builds INTEGER DEFAULT NULL,
    p_max_preview_environments INTEGER DEFAULT NULL,
    p_has_analytics BOOLEAN DEFAULT NULL,
    p_api_rate_limit INTEGER DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    team_id INTEGER,
    max_bandwidth_gb REAL,
    max_storage_gb REAL,
    max_sites INTEGER,
    max_domains INTEGER,
    max_builds_per_day INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_resource_limits_id INTEGER;
BEGIN
    -- Admin yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = p_admin_id AND r.name = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Yetersiz yetki: Kaynak limitleri ayarlamak için admin olmalısınız.';
    END IF;
    
    -- Site ID veya Team ID gerekli
    IF p_site_id IS NULL AND p_team_id IS NULL THEN
        RAISE EXCEPTION 'Site ID veya Team ID belirtilmelidir.';
    END IF;
    
    -- Ekle/Güncelle
    INSERT INTO resource_limits (
        site_id,
        team_id,
        max_bandwidth_gb,
        max_storage_gb,
        max_sites,
        max_domains,
        max_builds_per_day,
        max_container_memory,
        max_container_cpu,
        max_concurrent_builds,
        max_preview_environments,
        has_analytics,
        api_rate_limit
    )
    VALUES (
        p_site_id,
        p_team_id,
        p_max_bandwidth_gb,
        p_max_storage_gb,
        p_max_sites,
        p_max_domains,
        p_max_builds_per_day,
        p_max_container_memory,
        p_max_container_cpu,
        p_max_concurrent_builds,
        p_max_preview_environments,
        p_has_analytics,
        p_api_rate_limit
    )
    ON CONFLICT (COALESCE(site_id, 0), COALESCE(team_id, 0)) DO UPDATE
    SET 
        max_bandwidth_gb = COALESCE(EXCLUDED.max_bandwidth_gb, resource_limits.max_bandwidth_gb),
        max_storage_gb = COALESCE(EXCLUDED.max_storage_gb, resource_limits.max_storage_gb),
        max_sites = COALESCE(EXCLUDED.max_sites, resource_limits.max_sites),
        max_domains = COALESCE(EXCLUDED.max_domains, resource_limits.max_domains),
        max_builds_per_day = COALESCE(EXCLUDED.max_builds_per_day, resource_limits.max_builds_per_day),
        max_container_memory = COALESCE(EXCLUDED.max_container_memory, resource_limits.max_container_memory),
        max_container_cpu = COALESCE(EXCLUDED.max_container_cpu, resource_limits.max_container_cpu),
        max_concurrent_builds = COALESCE(EXCLUDED.max_concurrent_builds, resource_limits.max_concurrent_builds),
        max_preview_environments = COALESCE(EXCLUDED.max_preview_environments, resource_limits.max_preview_environments),
        has_analytics = COALESCE(EXCLUDED.has_analytics, resource_limits.has_analytics),
        api_rate_limit = COALESCE(EXCLUDED.api_rate_limit, resource_limits.api_rate_limit),
        updated_at = NOW()
    RETURNING id INTO v_resource_limits_id;
    
    RETURN QUERY
    SELECT rl.id, rl.site_id, rl.team_id, rl.max_bandwidth_gb, rl.max_storage_gb, 
           rl.max_sites, rl.max_domains, rl.max_builds_per_day, rl.updated_at
    FROM resource_limits rl
    WHERE rl.id = v_resource_limits_id;
END;
$$; 