-- ERİŞİM YÖNETİMİ FONKSİYONLARI

-- 1. Site Takım Erişimi Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION grant_site_team_access(
    p_admin_id INTEGER,
    p_site_id INTEGER,
    p_team_id INTEGER,
    p_access_level site_access_level DEFAULT 'read'
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    team_id INTEGER,
    access_level site_access_level,
    granted_by INTEGER,
    granted_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_site_team_access_id INTEGER;
BEGIN
    -- Site sahibi kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = p_site_id;
    
    IF v_site_owner_id IS NULL THEN
        RAISE EXCEPTION 'Site bulunamadı.';
    END IF;
    
    -- Yetki kontrolü
    IF v_site_owner_id <> p_admin_id THEN
        -- Site bir takıma aitse, takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_admin_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Site erişimi vermek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Site erişimi vermek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Erişim ekle/güncelle
    INSERT INTO site_team_access (site_id, team_id, access_level, granted_by)
    VALUES (p_site_id, p_team_id, p_access_level, p_admin_id)
    ON CONFLICT (site_id, team_id) DO UPDATE
    SET access_level = p_access_level, granted_by = p_admin_id, updated_at = NOW()
    RETURNING id INTO v_site_team_access_id;
    
    RETURN QUERY
    SELECT sta.id, sta.site_id, sta.team_id, sta.access_level, sta.granted_by, sta.granted_at
    FROM site_team_access sta
    WHERE sta.id = v_site_team_access_id;
END;
$$;

-- 2. Site Takım Erişimi Kaldırma Fonksiyonu
CREATE OR REPLACE FUNCTION revoke_site_team_access(
    p_admin_id INTEGER,
    p_site_id INTEGER,
    p_team_id INTEGER
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
BEGIN
    -- Site sahibi kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = p_site_id;
    
    IF v_site_owner_id IS NULL THEN
        RAISE EXCEPTION 'Site bulunamadı.';
    END IF;
    
    -- Yetki kontrolü
    IF v_site_owner_id <> p_admin_id THEN
        -- Site bir takıma aitse, takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_admin_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Site erişimini kaldırmak için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Site erişimini kaldırmak için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Erişimi kaldır
    DELETE FROM site_team_access
    WHERE site_id = p_site_id AND team_id = p_team_id;
    
    RETURN FOUND;
END;
$$;

-- 3. Docker Image Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_docker_image(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_repository VARCHAR,
    p_tag VARCHAR,
    p_image_id VARCHAR,
    p_size BIGINT,
    p_digest VARCHAR DEFAULT NULL,
    p_architecture VARCHAR DEFAULT NULL,
    p_layers JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    repository VARCHAR,
    tag VARCHAR,
    image_id VARCHAR,
    size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_access BOOLEAN;
    v_docker_image_id INTEGER;
BEGIN
    -- Kullanıcının siteye erişim yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM sites s
        LEFT JOIN site_team_access sta ON s.id = sta.site_id
        LEFT JOIN team_members tm ON sta.team_id = tm.team_id
        WHERE s.id = p_site_id AND (
            s.owner_id = p_user_id OR
            (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin', 'member'))
        )
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu siteye Docker image eklemek için site sahibi veya takım üyesi olmalısınız.';
    END IF;
    
    -- Docker image ekle
    INSERT INTO docker_images (
        site_id, 
        repository, 
        tag, 
        image_id, 
        size, 
        digest, 
        architecture, 
        layers
    )
    VALUES (
        p_site_id, 
        p_repository, 
        p_tag, 
        p_image_id, 
        p_size, 
        p_digest, 
        p_architecture, 
        COALESCE(p_layers, '[]')
    )
    RETURNING id INTO v_docker_image_id;
    
    RETURN QUERY
    SELECT di.id, di.site_id, di.repository, di.tag, di.image_id, di.size, di.created_at, di.status
    FROM docker_images di
    WHERE di.id = v_docker_image_id;
END;
$$;

-- 4. Docker Container Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_docker_container(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_docker_image_id INTEGER,
    p_container_id VARCHAR,
    p_name VARCHAR,
    p_ports JSONB DEFAULT NULL,
    p_env_variables JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    docker_image_id INTEGER,
    container_id VARCHAR,
    name VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_access BOOLEAN;
    v_docker_container_id INTEGER;
BEGIN
    -- Kullanıcının siteye erişim yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM sites s
        LEFT JOIN site_team_access sta ON s.id = sta.site_id
        LEFT JOIN team_members tm ON sta.team_id = tm.team_id
        WHERE s.id = p_site_id AND (
            s.owner_id = p_user_id OR
            (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin', 'member'))
        )
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu siteye Docker container eklemek için site sahibi veya takım üyesi olmalısınız.';
    END IF;
    
    -- Docker container ekle
    INSERT INTO docker_containers (
        site_id, 
        docker_image_id, 
        container_id, 
        name, 
        ports, 
        env_variables
    )
    VALUES (
        p_site_id, 
        p_docker_image_id, 
        p_container_id, 
        p_name, 
        COALESCE(p_ports, '{}'), 
        COALESCE(p_env_variables, '{}')
    )
    RETURNING id INTO v_docker_container_id;
    
    RETURN QUERY
    SELECT dc.id, dc.site_id, dc.docker_image_id, dc.container_id, dc.name, dc.status, dc.created_at
    FROM docker_containers dc
    WHERE dc.id = v_docker_container_id;
END;
$$;

-- 5. Docker Volume Mount Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_docker_volume_mount(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_container_id INTEGER,
    p_name VARCHAR,
    p_mount_path VARCHAR,
    p_size BIGINT DEFAULT NULL,
    p_type VARCHAR DEFAULT 'volume',
    p_persistent BOOLEAN DEFAULT TRUE
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    container_id INTEGER,
    name VARCHAR,
    mount_path VARCHAR,
    size BIGINT,
    type VARCHAR,
    persistent BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_access BOOLEAN;
    v_docker_volume_mount_id INTEGER;
BEGIN
    -- Kullanıcının siteye erişim yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM sites s
        LEFT JOIN site_team_access sta ON s.id = sta.site_id
        LEFT JOIN team_members tm ON sta.team_id = tm.team_id
        WHERE s.id = p_site_id AND (
            s.owner_id = p_user_id OR
            (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin', 'member'))
        )
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu siteye Docker volume mount eklemek için site sahibi veya takım üyesi olmalısınız.';
    END IF;
    
    -- Docker volume mount ekle
    INSERT INTO docker_volume_mounts (
        site_id, 
        container_id, 
        name, 
        mount_path, 
        size, 
        type, 
        persistent
    )
    VALUES (
        p_site_id, 
        p_container_id, 
        p_name, 
        p_mount_path, 
        p_size, 
        p_type, 
        p_persistent
    )
    RETURNING id INTO v_docker_volume_mount_id;
    
    RETURN QUERY
    SELECT dvm.id, dvm.site_id, dvm.container_id, dvm.name, dvm.mount_path, dvm.size, dvm.type, dvm.persistent, dvm.created_at
    FROM docker_volume_mounts dvm
    WHERE dvm.id = v_docker_volume_mount_id;
END;
$$;

-- 6. Site Günlük Metriklerini Ekleme/Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_site_metrics_history(
    p_site_id INTEGER,
    p_date DATE,
    p_hourly_metrics JSONB DEFAULT NULL,
    p_daily_summary JSONB DEFAULT NULL,
    p_total_requests INTEGER DEFAULT NULL,
    p_total_bandwidth BIGINT DEFAULT NULL,
    p_error_count INTEGER DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    date DATE,
    total_requests INTEGER,
    total_bandwidth BIGINT,
    error_count INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_metrics_id INTEGER;
BEGIN
    -- Site metriklerini ekle/güncelle
    INSERT INTO site_metrics_history (
        site_id, 
        date, 
        hourly_metrics, 
        daily_summary, 
        total_requests, 
        total_bandwidth, 
        error_count
    )
    VALUES (
        p_site_id, 
        p_date, 
        COALESCE(p_hourly_metrics, '{}'), 
        COALESCE(p_daily_summary, '{}'), 
        COALESCE(p_total_requests, 0), 
        COALESCE(p_total_bandwidth, 0), 
        COALESCE(p_error_count, 0)
    )
    ON CONFLICT (site_id, date) DO UPDATE
    SET 
        hourly_metrics = CASE 
            WHEN p_hourly_metrics IS NOT NULL THEN p_hourly_metrics 
            ELSE site_metrics_history.hourly_metrics 
        END,
        daily_summary = CASE 
            WHEN p_daily_summary IS NOT NULL THEN p_daily_summary 
            ELSE site_metrics_history.daily_summary 
        END,
        total_requests = CASE 
            WHEN p_total_requests IS NOT NULL THEN p_total_requests 
            ELSE site_metrics_history.total_requests 
        END,
        total_bandwidth = CASE 
            WHEN p_total_bandwidth IS NOT NULL THEN p_total_bandwidth 
            ELSE site_metrics_history.total_bandwidth 
        END,
        error_count = CASE 
            WHEN p_error_count IS NOT NULL THEN p_error_count 
            ELSE site_metrics_history.error_count 
        END
    RETURNING id INTO v_metrics_id;
    
    RETURN QUERY
    SELECT smh.id, smh.site_id, smh.date, smh.total_requests, smh.total_bandwidth, smh.error_count
    FROM site_metrics_history smh
    WHERE smh.id = v_metrics_id;
END;
$$;

-- 7. Site Günlük Metriklerini Alma Fonksiyonu
CREATE OR REPLACE FUNCTION get_site_metrics_history(
    p_site_id INTEGER,
    p_start_date DATE,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    date DATE,
    total_requests INTEGER,
    total_bandwidth BIGINT,
    error_count INTEGER,
    daily_summary JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        smh.id, 
        smh.site_id, 
        smh.date, 
        smh.total_requests, 
        smh.total_bandwidth, 
        smh.error_count, 
        smh.daily_summary
    FROM site_metrics_history smh
    WHERE 
        smh.site_id = p_site_id AND 
        smh.date >= p_start_date AND
        (p_end_date IS NULL OR smh.date <= p_end_date)
    ORDER BY smh.date ASC;
END;
$$;

-- 8. Preview Environment Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_preview_environment(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_name VARCHAR,
    p_branch VARCHAR,
    p_commit_hash VARCHAR DEFAULT NULL,
    p_url VARCHAR,
    p_basic_auth_username VARCHAR DEFAULT NULL,
    p_basic_auth_password VARCHAR DEFAULT NULL,
    p_environment_variables JSONB DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_auto_expire BOOLEAN DEFAULT TRUE
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    name VARCHAR,
    branch VARCHAR,
    commit_hash VARCHAR,
    status VARCHAR,
    url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_expire BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_access BOOLEAN;
    v_preview_env_id INTEGER;
BEGIN
    -- Kullanıcının siteye erişim yetkisi kontrolü
    SELECT EXISTS(
        SELECT 1
        FROM sites s
        LEFT JOIN site_team_access sta ON s.id = sta.site_id
        LEFT JOIN team_members tm ON sta.team_id = tm.team_id
        WHERE s.id = p_site_id AND (
            s.owner_id = p_user_id OR
            (tm.user_id = p_user_id AND tm.role IN ('owner', 'admin', 'member'))
        )
    ) INTO v_has_access;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu siteye preview environment eklemek için site sahibi veya takım üyesi olmalısınız.';
    END IF;
    
    -- Preview environment ekle
    INSERT INTO preview_environments (
        site_id, 
        name, 
        branch, 
        commit_hash, 
        url, 
        basic_auth_username, 
        basic_auth_password, 
        environment_variables, 
        expires_at, 
        auto_expire, 
        created_by
    )
    VALUES (
        p_site_id, 
        p_name, 
        p_branch, 
        p_commit_hash, 
        p_url, 
        p_basic_auth_username, 
        p_basic_auth_password, 
        COALESCE(p_environment_variables, '{}'), 
        p_expires_at, 
        p_auto_expire, 
        p_user_id
    )
    RETURNING id INTO v_preview_env_id;
    
    RETURN QUERY
    SELECT pe.id, pe.site_id, pe.name, pe.branch, pe.commit_hash, pe.status, pe.url, pe.created_at, pe.expires_at, pe.auto_expire
    FROM preview_environments pe
    WHERE pe.id = v_preview_env_id;
END;
$$;

-- 9. Preview Environment Silme Fonksiyonu
CREATE OR REPLACE FUNCTION delete_preview_environment(
    p_user_id INTEGER,
    p_preview_env_id INTEGER
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_has_access BOOLEAN;
    v_created_by INTEGER;
BEGIN
    -- Preview environment'ı getir
    SELECT pe.site_id, pe.created_by
    INTO v_site_id, v_created_by
    FROM preview_environments pe
    WHERE pe.id = p_preview_env_id;
    
    IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'Preview environment bulunamadı.';
    END IF;
    
    -- Kullanıcının siteye erişim yetkisi kontrolü
    IF v_created_by = p_user_id THEN
        -- Oluşturan kişi her zaman silebilir
        v_has_access := TRUE;
    ELSE
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
    END IF;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Preview environment silmek için oluşturan kişi, site sahibi veya takım yöneticisi olmalısınız.';
    END IF;
    
    -- Preview environment sil
    DELETE FROM preview_environments
    WHERE id = p_preview_env_id;
    
    RETURN FOUND;
END;
$$;

-- 10. Email Notification Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_email_notification(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_event_type notification_event_type,
    p_recipients JSONB,
    p_enabled BOOLEAN DEFAULT TRUE,
    p_template_id VARCHAR DEFAULT NULL,
    p_custom_message JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    event_type notification_event_type,
    recipients JSONB,
    enabled BOOLEAN,
    template_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_access BOOLEAN;
    v_notification_id INTEGER;
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
        RAISE EXCEPTION 'Yetersiz yetki: Bu siteye email notification eklemek için site sahibi veya takım yöneticisi olmalısınız.';
    END IF;
    
    -- Email notification ekle
    INSERT INTO email_notifications (
        site_id, 
        event_type, 
        recipients, 
        enabled, 
        template_id, 
        custom_message, 
        created_by
    )
    VALUES (
        p_site_id, 
        p_event_type, 
        p_recipients, 
        p_enabled, 
        p_template_id, 
        p_custom_message, 
        p_user_id
    )
    RETURNING id INTO v_notification_id;
    
    RETURN QUERY
    SELECT en.id, en.site_id, en.event_type, en.recipients, en.enabled, en.template_id, en.created_at
    FROM email_notifications en
    WHERE en.id = v_notification_id;
END;
$$; 