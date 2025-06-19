-- DEPLOYMENT YÖNETİMİ FONKSİYONLARI

-- 1. Deployment Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_deployment(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_commit_hash VARCHAR DEFAULT NULL,
    p_commit_message TEXT DEFAULT NULL,
    p_branch VARCHAR DEFAULT 'main',
    p_is_production BOOLEAN DEFAULT TRUE,
    p_is_auto_deployment BOOLEAN DEFAULT FALSE,
    p_build_settings JSONB DEFAULT NULL,
    p_environment_variables JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    user_id INTEGER,
    commit_hash VARCHAR,
    branch VARCHAR,
    status deployment_status,
    created_at TIMESTAMP WITH TIME ZONE,
    is_production BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_deployment_id INTEGER;
    v_site_status site_status;
BEGIN
    -- Site sahibi ve takım kontrolü
    SELECT owner_id, team_id, status INTO v_site_owner_id, v_site_team_id, v_site_status
    FROM sites
    WHERE id = p_site_id;
    
    IF v_site_status = 'maintenance' THEN
        RAISE EXCEPTION 'Site bakım modundadır ve şu anda dağıtım yapılamaz.';
    END IF;
    
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin', 'member') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Bu site için dağıtım başlatmak için site sahibi veya takım üyesi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu site için dağıtım başlatmak için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Site durumunu güncelle
    UPDATE sites SET status = 'building', updated_at = NOW() WHERE id = p_site_id;
    
    -- Deployment oluştur
    INSERT INTO deployments (
        site_id, 
        user_id, 
        commit_hash, 
        commit_message, 
        branch, 
        status, 
        is_production, 
        is_auto_deployment,
        build_settings,
        environment_variables
    )
    VALUES (
        p_site_id, 
        p_user_id, 
        p_commit_hash, 
        p_commit_message, 
        p_branch, 
        'queued', 
        p_is_production, 
        p_is_auto_deployment,
        COALESCE(p_build_settings, '{}'),
        COALESCE(p_environment_variables, '{}')
    )
    RETURNING id INTO v_deployment_id;
    
    RETURN QUERY
    SELECT d.id, d.site_id, d.user_id, d.commit_hash, d.branch, d.status, d.created_at, d.is_production
    FROM deployments d
    WHERE d.id = v_deployment_id;
END;
$$;

-- 2. Deployment Durumu Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_deployment_status(
    p_deployment_id INTEGER,
    p_status deployment_status,
    p_build_log TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_deployment_url VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    status deployment_status,
    started_at TIMESTAMP WITH TIME ZONE,
    deployed_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    build_time INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_started_at TIMESTAMP WITH TIME ZONE;
    v_build_time INTEGER;
BEGIN
    -- Mevcut deployment bilgilerini al
    SELECT site_id, started_at INTO v_site_id, v_started_at
    FROM deployments
    WHERE id = p_deployment_id;
    
    IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'Deployment bulunamadı.';
    END IF;
    
    -- Status değerine göre yapılacaklar
    CASE p_status
        WHEN 'building' THEN
            UPDATE deployments SET 
                status = p_status,
                started_at = NOW()
            WHERE id = p_deployment_id;
        
        WHEN 'success' THEN
            -- Build süresini hesapla
            v_build_time := EXTRACT(EPOCH FROM (NOW() - COALESCE(v_started_at, NOW())));
            
            UPDATE deployments SET 
                status = p_status,
                finished_at = NOW(),
                deployed_at = NOW(),
                build_log = p_build_log,
                deployment_url = p_deployment_url,
                build_time = v_build_time
            WHERE id = p_deployment_id;
            
            -- Site durumunu güncelle
            UPDATE sites SET 
                status = 'active',
                last_deployed_at = NOW(),
                updated_at = NOW()
            WHERE id = v_site_id;
        
        WHEN 'error' THEN
            -- Build süresini hesapla
            v_build_time := EXTRACT(EPOCH FROM (NOW() - COALESCE(v_started_at, NOW())));
            
            UPDATE deployments SET 
                status = p_status,
                finished_at = NOW(),
                build_log = p_build_log,
                error_message = p_error_message,
                build_time = v_build_time
            WHERE id = p_deployment_id;
            
            -- Site durumunu güncelle
            UPDATE sites SET 
                status = 'error',
                updated_at = NOW()
            WHERE id = v_site_id;
        
        WHEN 'cancelled' THEN
            UPDATE deployments SET 
                status = p_status,
                finished_at = NOW()
            WHERE id = p_deployment_id;
            
            -- Site durumunu güncelle
            UPDATE sites SET 
                status = 'active',
                updated_at = NOW()
            WHERE id = v_site_id;
        
        ELSE
            UPDATE deployments SET 
                status = p_status
            WHERE id = p_deployment_id;
    END CASE;
    
    RETURN QUERY
    SELECT d.id, d.site_id, d.status, d.started_at, d.deployed_at, d.finished_at, d.build_time
    FROM deployments d
    WHERE d.id = p_deployment_id;
END;
$$;

-- 3. Deployment İptal Etme Fonksiyonu
CREATE OR REPLACE FUNCTION cancel_deployment(
    p_user_id INTEGER,
    p_deployment_id INTEGER
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    status deployment_status,
    finished_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_deployment_status deployment_status;
BEGIN
    -- Deployment ve site bilgilerini al
    SELECT d.site_id, d.status, s.owner_id, s.team_id 
    INTO v_site_id, v_deployment_status, v_site_owner_id, v_site_team_id
    FROM deployments d
    JOIN sites s ON d.site_id = s.id
    WHERE d.id = p_deployment_id;
    
    IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'Deployment bulunamadı.';
    END IF;
    
    -- Tamamlanmış deployment'ları iptal edemezsin
    IF v_deployment_status IN ('success', 'error', 'cancelled') THEN
        RAISE EXCEPTION 'Bu deployment zaten tamamlanmış veya iptal edilmiş.';
    END IF;
    
    -- Yetki kontrolü
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Deployment iptal etmek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Deployment iptal etmek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Deployment'ı iptal et
    UPDATE deployments SET 
        status = 'cancelled',
        finished_at = NOW()
    WHERE id = p_deployment_id;
    
    -- Site durumunu güncelle
    UPDATE sites SET 
        status = 'active',
        updated_at = NOW()
    WHERE id = v_site_id;
    
    RETURN QUERY
    SELECT d.id, d.site_id, d.status, d.finished_at
    FROM deployments d
    WHERE d.id = p_deployment_id;
END;
$$;

-- 4. Config Var Ekleme/Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION upsert_config_var(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_key VARCHAR,
    p_value TEXT,
    p_is_sensitive BOOLEAN DEFAULT FALSE,
    p_comment TEXT DEFAULT NULL,
    p_environment VARCHAR DEFAULT 'production'
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    key VARCHAR,
    value TEXT,
    is_sensitive BOOLEAN,
    environment VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_config_var_id INTEGER;
BEGIN
    -- Site sahibi ve takım kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = p_site_id;
    
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Bu siteye konfigürasyon değişkeni eklemek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu siteye konfigürasyon değişkeni eklemek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Config var ekleme/güncelleme
    INSERT INTO config_vars (site_id, key, value, is_sensitive, created_by, comment, environment)
    VALUES (p_site_id, p_key, p_value, p_is_sensitive, p_user_id, p_comment, p_environment)
    ON CONFLICT (site_id, key, environment) DO UPDATE
    SET 
        value = EXCLUDED.value,
        is_sensitive = EXCLUDED.is_sensitive,
        updated_by = p_user_id,
        updated_at = NOW(),
        comment = COALESCE(EXCLUDED.comment, config_vars.comment)
    RETURNING id INTO v_config_var_id;
    
    RETURN QUERY
    SELECT cv.id, cv.site_id, cv.key, cv.value, cv.is_sensitive, cv.environment, cv.created_at, cv.updated_at
    FROM config_vars cv
    WHERE cv.id = v_config_var_id;
END;
$$;

-- 5. Config Var Silme Fonksiyonu
CREATE OR REPLACE FUNCTION delete_config_var(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_key VARCHAR,
    p_environment VARCHAR DEFAULT 'production'
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
BEGIN
    -- Site sahibi ve takım kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = p_site_id;
    
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Bu sitenin konfigürasyon değişkenini silmek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu sitenin konfigürasyon değişkenini silmek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Config var silme
    DELETE FROM config_vars
    WHERE site_id = p_site_id AND key = p_key AND environment = p_environment;
    
    RETURN FOUND;
END;
$$;

-- 6. Log Kaydı Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION add_log_entry(
    p_site_id INTEGER,
    p_deployment_id INTEGER DEFAULT NULL,
    p_source VARCHAR,
    p_level VARCHAR DEFAULT 'info',
    p_message TEXT,
    p_metadata JSONB DEFAULT NULL,
    p_instance_id VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    deployment_id INTEGER,
    log_timestamp TIMESTAMP WITH TIME ZONE,
    source VARCHAR,
    level VARCHAR,
    message TEXT
) LANGUAGE plpgsql AS $$
DECLARE
    v_log_id INTEGER;
BEGIN
    INSERT INTO log_entries (
        site_id,
        deployment_id,
        source,
        level,
        message,
        metadata,
        instance_id
    )
    VALUES (
        p_site_id,
        p_deployment_id,
        p_source,
        p_level,
        p_message,
        COALESCE(p_metadata, '{}'),
        p_instance_id
    )
    RETURNING id INTO v_log_id;
    
    RETURN QUERY
    SELECT le.id, le.site_id, le.deployment_id, le.log_timestamp, le.source, le.level, le.message
    FROM log_entries le
    WHERE le.id = v_log_id;
END;
$$;

-- 7. Site Metriği Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION add_site_metrics(
    p_site_id INTEGER,
    p_uptime_percentage REAL DEFAULT NULL,
    p_performance_status VARCHAR DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_cpu_usage REAL DEFAULT NULL,
    p_memory_usage BIGINT DEFAULT NULL,
    p_storage_usage BIGINT DEFAULT NULL,
    p_visitors_count INTEGER DEFAULT NULL,
    p_page_views INTEGER DEFAULT NULL,
    p_unique_visitors INTEGER DEFAULT NULL,
    p_bounce_rate REAL DEFAULT NULL,
    p_avg_session_duration INTEGER DEFAULT NULL,
    p_geo_distribution JSONB DEFAULT NULL,
    p_device_breakdown JSONB DEFAULT NULL,
    p_browser_breakdown JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    collected_at TIMESTAMP WITH TIME ZONE,
    uptime_percentage REAL,
    response_time_ms INTEGER,
    cpu_usage REAL,
    memory_usage BIGINT,
    visitors_count INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_metric_id INTEGER;
BEGIN
    INSERT INTO site_metrics (
        site_id,
        uptime_percentage,
        performance_status,
        response_time_ms,
        cpu_usage,
        memory_usage,
        storage_usage,
        visitors_count,
        page_views,
        unique_visitors,
        bounce_rate,
        avg_session_duration,
        geo_distribution,
        device_breakdown,
        browser_breakdown
    )
    VALUES (
        p_site_id,
        p_uptime_percentage,
        p_performance_status,
        p_response_time_ms,
        p_cpu_usage,
        p_memory_usage,
        p_storage_usage,
        p_visitors_count,
        p_page_views,
        p_unique_visitors,
        p_bounce_rate,
        p_avg_session_duration,
        COALESCE(p_geo_distribution, '{}'),
        COALESCE(p_device_breakdown, '{}'),
        COALESCE(p_browser_breakdown, '{}')
    )
    RETURNING id INTO v_metric_id;
    
    RETURN QUERY
    SELECT sm.id, sm.site_id, sm.collected_at, sm.uptime_percentage, 
           sm.response_time_ms, sm.cpu_usage, sm.memory_usage, sm.visitors_count
    FROM site_metrics sm
    WHERE sm.id = v_metric_id;
END;
$$;

-- 8. Deployment Geri Alma Fonksiyonu (Rollback)
CREATE OR REPLACE FUNCTION rollback_deployment(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_deployment_id INTEGER
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    status deployment_status,
    is_rollback BOOLEAN,
    rollback_from_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_deployment_status deployment_status;
    v_new_deployment_id INTEGER;
BEGIN
    -- Site sahibi ve takım kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = p_site_id;
    
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Deployment geri almak için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Deployment geri almak için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Geri alınacak deployment'ın durumunu kontrol et
    SELECT status INTO v_deployment_status
    FROM deployments
    WHERE id = p_deployment_id AND site_id = p_site_id;
    
    IF v_deployment_status IS NULL THEN
        RAISE EXCEPTION 'Belirtilen deployment bulunamadı.';
    END IF;
    
    IF v_deployment_status <> 'success' THEN
        RAISE EXCEPTION 'Yalnızca başarılı deployment'lar geri alınabilir.';
    END IF;
    
    -- Site durumunu güncelle
    UPDATE sites SET status = 'building', updated_at = NOW() WHERE id = p_site_id;
    
    -- Geri alma deployment'ı oluştur
    INSERT INTO deployments (
        site_id,
        user_id,
        commit_hash,
        commit_message,
        branch,
        status,
        is_production,
        is_rollback,
        rollback_from_id
    )
    SELECT 
        site_id,
        p_user_id,
        commit_hash,
        'Rollback to deployment #' || id,
        branch,
        'queued',
        TRUE,
        TRUE,
        id
    FROM deployments
    WHERE id = p_deployment_id
    RETURNING id INTO v_new_deployment_id;
    
    RETURN QUERY
    SELECT d.id, d.site_id, d.status, d.is_rollback, d.rollback_from_id, d.created_at
    FROM deployments d
    WHERE d.id = v_new_deployment_id;
END;
$$;

-- 9. Deployment Metadata Ekleme/Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_deployment_metadata(
    p_deployment_id INTEGER,
    p_dependencies JSONB DEFAULT NULL,
    p_build_output JSONB DEFAULT NULL,
    p_bundle_size BIGINT DEFAULT NULL,
    p_framework_version VARCHAR DEFAULT NULL,
    p_performance_score JSONB DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    deployment_id INTEGER,
    dependencies JSONB,
    bundle_size BIGINT,
    framework_version VARCHAR,
    performance_score JSONB
) LANGUAGE plpgsql AS $$
DECLARE
    v_metadata_id INTEGER;
BEGIN
    -- Metadata var mı kontrol et
    SELECT id INTO v_metadata_id
    FROM deployment_metadata
    WHERE deployment_id = p_deployment_id;
    
    -- Varsa güncelle, yoksa ekle
    IF v_metadata_id IS NULL THEN
        INSERT INTO deployment_metadata (
            deployment_id,
            dependencies,
            build_output,
            bundle_size,
            framework_version,
            performance_score
        )
        VALUES (
            p_deployment_id,
            COALESCE(p_dependencies, '{}'),
            COALESCE(p_build_output, '{}'),
            p_bundle_size,
            p_framework_version,
            COALESCE(p_performance_score, '{}')
        )
        RETURNING id INTO v_metadata_id;
    ELSE
        UPDATE deployment_metadata SET
            dependencies = COALESCE(p_dependencies, dependencies),
            build_output = COALESCE(p_build_output, build_output),
            bundle_size = COALESCE(p_bundle_size, bundle_size),
            framework_version = COALESCE(p_framework_version, framework_version),
            performance_score = COALESCE(p_performance_score, performance_score)
        WHERE id = v_metadata_id;
    END IF;
    
    RETURN QUERY
    SELECT dm.id, dm.deployment_id, dm.dependencies, dm.bundle_size, dm.framework_version, dm.performance_score
    FROM deployment_metadata dm
    WHERE dm.id = v_metadata_id;
END;
$$;

-- 10. Son Site Metriklerini Alma Fonksiyonu
CREATE OR REPLACE FUNCTION get_latest_site_metrics(
    p_site_id INTEGER
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    collected_at TIMESTAMP WITH TIME ZONE,
    uptime_percentage REAL,
    performance_status VARCHAR,
    response_time_ms INTEGER,
    cpu_usage REAL,
    memory_usage BIGINT,
    storage_usage BIGINT,
    visitors_count INTEGER,
    page_views INTEGER,
    unique_visitors INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT sm.id, sm.site_id, sm.collected_at, sm.uptime_percentage, sm.performance_status,
           sm.response_time_ms, sm.cpu_usage, sm.memory_usage, sm.storage_usage,
           sm.visitors_count, sm.page_views, sm.unique_visitors
    FROM site_metrics sm
    WHERE sm.site_id = p_site_id
    ORDER BY sm.collected_at DESC
    LIMIT 1;
END;
$$; 