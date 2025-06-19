-- API, ENTEGRASYON VE FEATURE FLAG FONKSİYONLARI

-- 1. API Anahtarı Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_api_key(
    p_user_id INTEGER,
    p_name VARCHAR,
    p_scopes TEXT[],
    p_team_id INTEGER DEFAULT NULL,
    p_expires_in INTEGER DEFAULT 365 -- Gün cinsinden
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    key_prefix VARCHAR,
    full_key VARCHAR, -- Sadece yaratıldığında döner
    user_id INTEGER,
    team_id INTEGER,
    scopes TEXT[],
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_team_access BOOLEAN := FALSE;
    v_random_key VARCHAR;
    v_key_prefix VARCHAR;
    v_key_hash TEXT;
    v_api_key_id INTEGER;
BEGIN
    -- Takım yetkisini kontrol et
    IF p_team_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM team_members
            WHERE team_id = p_team_id AND user_id = p_user_id AND role IN ('owner', 'admin')
        ) INTO v_has_team_access;
        
        IF NOT v_has_team_access THEN
            RAISE EXCEPTION 'Yetersiz yetki: Takım adına API anahtarı oluşturmak için owner veya admin olmalısınız.';
        END IF;
    END IF;
    
    -- Anahtar oluştur
    v_random_key := encode(gen_random_bytes(32), 'hex');
    v_key_prefix := substring(v_random_key from 1 for 8);
    v_key_hash := crypt(v_random_key, gen_salt('bf'));
    
    -- API anahtarını kaydet
    INSERT INTO api_keys (
        name,
        key_prefix,
        key_hash,
        user_id,
        team_id,
        scopes,
        expires_at
    )
    VALUES (
        p_name,
        v_key_prefix,
        v_key_hash,
        p_user_id,
        p_team_id,
        p_scopes,
        CASE WHEN p_expires_in IS NOT NULL THEN 
            NOW() + (p_expires_in || ' days')::INTERVAL
        ELSE
            NULL
        END
    )
    RETURNING id INTO v_api_key_id;
    
    RETURN QUERY
    SELECT 
        ak.id, 
        ak.name, 
        ak.key_prefix, 
        v_key_prefix || '.' || substring(v_random_key from 9) as full_key, -- Tam anahtarı sadece şimdi döndür
        ak.user_id,
        ak.team_id,
        ak.scopes,
        ak.expires_at,
        ak.created_at
    FROM api_keys ak
    WHERE ak.id = v_api_key_id;
END;
$$;

-- 2. API Anahtarı Doğrulama Fonksiyonu
CREATE OR REPLACE FUNCTION verify_api_key(
    p_api_key VARCHAR,
    p_required_scope TEXT DEFAULT NULL
) RETURNS TABLE(
    is_valid BOOLEAN,
    user_id INTEGER,
    team_id INTEGER,
    scopes TEXT[],
    name VARCHAR
) LANGUAGE plpgsql AS $$
DECLARE
    v_key_prefix VARCHAR;
    v_key_rest VARCHAR;
    v_key_record RECORD;
BEGIN
    -- Anahtarı parçalara ayır
    v_key_prefix := split_part(p_api_key, '.', 1);
    v_key_rest := split_part(p_api_key, '.', 2);
    
    -- Anahtarı ara
    SELECT 
        ak.id, 
        ak.key_hash, 
        ak.user_id, 
        ak.team_id, 
        ak.scopes, 
        ak.expires_at, 
        ak.is_active,
        ak.revoked_at,
        ak.name
    INTO v_key_record
    FROM api_keys ak
    WHERE ak.key_prefix = v_key_prefix;
    
    -- Anahtar bulunamadı
    IF v_key_record.id IS NULL THEN
        RETURN QUERY
        SELECT FALSE, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- Anahtarın geçerli olup olmadığını kontrol et
    IF NOT v_key_record.is_active OR v_key_record.revoked_at IS NOT NULL OR 
       (v_key_record.expires_at IS NOT NULL AND v_key_record.expires_at < NOW()) OR
       NOT (crypt(v_key_prefix || v_key_rest, v_key_record.key_hash) = v_key_record.key_hash) THEN
        RETURN QUERY
        SELECT FALSE, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- İstenen kapsamı kontrol et
    IF p_required_scope IS NOT NULL AND NOT (p_required_scope = ANY(v_key_record.scopes)) THEN
        RETURN QUERY
        SELECT FALSE, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- Son kullanım zamanını güncelle
    UPDATE api_keys
    SET last_used_at = NOW()
    WHERE id = v_key_record.id;
    
    -- Geçerli anahtarın bilgilerini döndür
    RETURN QUERY
    SELECT 
        TRUE, 
        v_key_record.user_id, 
        v_key_record.team_id, 
        v_key_record.scopes, 
        v_key_record.name;
END;
$$;

-- 3. Entegrasyon Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_integration(
    p_user_id INTEGER,
    p_provider VARCHAR,
    p_provider_account_id VARCHAR,
    p_access_token TEXT,
    p_refresh_token TEXT DEFAULT NULL,
    p_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_team_id INTEGER DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    user_id INTEGER,
    team_id INTEGER,
    provider VARCHAR,
    provider_account_id VARCHAR,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_has_team_access BOOLEAN := FALSE;
    v_integration_id INTEGER;
BEGIN
    -- Takım yetkisini kontrol et
    IF p_team_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM team_members
            WHERE team_id = p_team_id AND user_id = p_user_id AND role IN ('owner', 'admin')
        ) INTO v_has_team_access;
        
        IF NOT v_has_team_access THEN
            RAISE EXCEPTION 'Yetersiz yetki: Takım adına entegrasyon oluşturmak için owner veya admin olmalısınız.';
        END IF;
    END IF;
    
    -- Önceki aynı provider/account entegrasyonunu devre dışı bırak
    UPDATE integrations
    SET is_active = FALSE, updated_at = NOW()
    WHERE 
        provider = p_provider AND 
        provider_account_id = p_provider_account_id AND
        (
            (p_team_id IS NULL AND user_id = p_user_id AND team_id IS NULL) OR
            (p_team_id IS NOT NULL AND team_id = p_team_id)
        );
    
    -- Yeni entegrasyonu ekle
    INSERT INTO integrations (
        user_id,
        team_id,
        provider,
        provider_account_id,
        access_token,
        refresh_token,
        token_expires_at,
        metadata
    )
    VALUES (
        p_user_id,
        p_team_id,
        p_provider,
        p_provider_account_id,
        p_access_token,
        p_refresh_token,
        p_token_expires_at,
        COALESCE(p_metadata, '{}')
    )
    RETURNING id INTO v_integration_id;
    
    RETURN QUERY
    SELECT i.id, i.user_id, i.team_id, i.provider, i.provider_account_id, i.is_active, i.created_at
    FROM integrations i
    WHERE i.id = v_integration_id;
END;
$$;

-- 4. Entegrasyon Devre Dışı Bırakma Fonksiyonu
CREATE OR REPLACE FUNCTION disable_integration(
    p_user_id INTEGER,
    p_integration_id INTEGER
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_integration_owner_id INTEGER;
    v_integration_team_id INTEGER;
    v_has_access BOOLEAN := FALSE;
BEGIN
    -- Entegrasyon sahibini ve takımını al
    SELECT user_id, team_id 
    INTO v_integration_owner_id, v_integration_team_id
    FROM integrations
    WHERE id = p_integration_id;
    
    IF v_integration_owner_id IS NULL THEN
        RAISE EXCEPTION 'Entegrasyon bulunamadı.';
    END IF;
    
    -- Erişim yetkisini kontrol et
    IF v_integration_owner_id = p_user_id THEN
        v_has_access := TRUE;
    ELSIF v_integration_team_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM team_members
            WHERE team_id = v_integration_team_id AND user_id = p_user_id AND role IN ('owner', 'admin')
        ) INTO v_has_access;
    END IF;
    
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bu entegrasyonu devre dışı bırakmak için entegrasyonun sahibi veya takım yöneticisi olmalısınız.';
    END IF;
    
    -- Entegrasyonu devre dışı bırak
    UPDATE integrations
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = p_integration_id;
    
    RETURN FOUND;
END;
$$;

-- 5. Feature Flag Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_feature_flag(
    p_admin_id INTEGER,
    p_name VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_default_value BOOLEAN DEFAULT FALSE,
    p_is_global BOOLEAN DEFAULT FALSE
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    default_value BOOLEAN,
    is_global BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_feature_flag_id INTEGER;
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
        RAISE EXCEPTION 'Yetersiz yetki: Feature flag oluşturmak için admin olmalısınız.';
    END IF;
    
    -- Feature flag oluştur
    INSERT INTO feature_flags (name, description, default_value, is_global)
    VALUES (p_name, p_description, p_default_value, p_is_global)
    RETURNING id INTO v_feature_flag_id;
    
    RETURN QUERY
    SELECT ff.id, ff.name, ff.description, ff.default_value, ff.is_global, ff.created_at
    FROM feature_flags ff
    WHERE ff.id = v_feature_flag_id;
END;
$$;

-- 6. Feature Flag Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_feature_flag(
    p_admin_id INTEGER,
    p_feature_flag_id INTEGER,
    p_description TEXT DEFAULT NULL,
    p_default_value BOOLEAN DEFAULT NULL,
    p_is_global BOOLEAN DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    default_value BOOLEAN,
    is_global BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
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
        RAISE EXCEPTION 'Yetersiz yetki: Feature flag güncellemek için admin olmalısınız.';
    END IF;
    
    -- Feature flag güncelle
    UPDATE feature_flags
    SET 
        description = COALESCE(p_description, description),
        default_value = COALESCE(p_default_value, default_value),
        is_global = COALESCE(p_is_global, is_global),
        updated_at = NOW()
    WHERE id = p_feature_flag_id;
    
    RETURN QUERY
    SELECT ff.id, ff.name, ff.description, ff.default_value, ff.is_global, ff.updated_at
    FROM feature_flags ff
    WHERE ff.id = p_feature_flag_id;
END;
$$;

-- 7. Kullanıcı Feature Flag Ayarlama Fonksiyonu
CREATE OR REPLACE FUNCTION set_user_feature_flag(
    p_admin_id INTEGER,
    p_user_id INTEGER,
    p_feature_flag_id INTEGER,
    p_enabled BOOLEAN
) RETURNS TABLE(
    id INTEGER,
    user_id INTEGER,
    feature_flag_id INTEGER,
    enabled BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_user_feature_flag_id INTEGER;
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
        RAISE EXCEPTION 'Yetersiz yetki: Kullanıcı feature flag atamak için admin olmalısınız.';
    END IF;
    
    -- Feature flag ekle/güncelle
    INSERT INTO user_feature_flags (user_id, feature_flag_id, enabled)
    VALUES (p_user_id, p_feature_flag_id, p_enabled)
    ON CONFLICT (user_id, feature_flag_id) DO UPDATE
    SET enabled = EXCLUDED.enabled, updated_at = NOW()
    RETURNING id INTO v_user_feature_flag_id;
    
    RETURN QUERY
    SELECT uff.id, uff.user_id, uff.feature_flag_id, uff.enabled, uff.updated_at
    FROM user_feature_flags uff
    WHERE uff.id = v_user_feature_flag_id;
END;
$$;

-- 8. Takım Feature Flag Ayarlama Fonksiyonu
CREATE OR REPLACE FUNCTION set_team_feature_flag(
    p_admin_id INTEGER,
    p_team_id INTEGER,
    p_feature_flag_id INTEGER,
    p_enabled BOOLEAN
) RETURNS TABLE(
    id INTEGER,
    team_id INTEGER,
    feature_flag_id INTEGER,
    enabled BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_team_feature_flag_id INTEGER;
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
        RAISE EXCEPTION 'Yetersiz yetki: Takım feature flag atamak için admin olmalısınız.';
    END IF;
    
    -- Feature flag ekle/güncelle
    INSERT INTO team_feature_flags (team_id, feature_flag_id, enabled)
    VALUES (p_team_id, p_feature_flag_id, p_enabled)
    ON CONFLICT (team_id, feature_flag_id) DO UPDATE
    SET enabled = EXCLUDED.enabled, updated_at = NOW()
    RETURNING id INTO v_team_feature_flag_id;
    
    RETURN QUERY
    SELECT tff.id, tff.team_id, tff.feature_flag_id, tff.enabled, tff.updated_at
    FROM team_feature_flags tff
    WHERE tff.id = v_team_feature_flag_id;
END;
$$;

-- 9. Feature Flag Kontrolü Fonksiyonu
CREATE OR REPLACE FUNCTION check_feature_flag(
    p_user_id INTEGER,
    p_flag_name VARCHAR,
    p_team_id INTEGER DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_flag_id INTEGER;
    v_default_value BOOLEAN;
    v_is_global BOOLEAN;
    v_user_enabled BOOLEAN;
    v_team_enabled BOOLEAN;
BEGIN
    -- Feature flag bilgilerini al
    SELECT id, default_value, is_global
    INTO v_flag_id, v_default_value, v_is_global
    FROM feature_flags
    WHERE name = p_flag_name;
    
    IF v_flag_id IS NULL THEN
        RETURN FALSE; -- Flag bulunamadı, varsayılan olarak devre dışı
    END IF;
    
    -- Global flag ise ve aktifse, herkese açık
    IF v_is_global = TRUE AND v_default_value = TRUE THEN
        RETURN TRUE;
    END IF;
    
    -- Kullanıcı özel ayarı kontrol et
    SELECT enabled INTO v_user_enabled
    FROM user_feature_flags
    WHERE user_id = p_user_id AND feature_flag_id = v_flag_id;
    
    -- Kullanıcı için özel ayar varsa onu kullan
    IF v_user_enabled IS NOT NULL THEN
        RETURN v_user_enabled;
    END IF;
    
    -- Takım özel ayarı kontrol et (eğer takım belirtilmişse)
    IF p_team_id IS NOT NULL THEN
        SELECT enabled INTO v_team_enabled
        FROM team_feature_flags
        WHERE team_id = p_team_id AND feature_flag_id = v_flag_id;
        
        -- Takım için özel ayar varsa onu kullan
        IF v_team_enabled IS NOT NULL THEN
            RETURN v_team_enabled;
        END IF;
    END IF;
    
    -- Kullanıcının üye olduğu tüm takımları kontrol et
    IF p_team_id IS NULL THEN
        SELECT tff.enabled
        INTO v_team_enabled
        FROM team_feature_flags tff
        JOIN team_members tm ON tff.team_id = tm.team_id
        WHERE tm.user_id = p_user_id AND tff.feature_flag_id = v_flag_id
        LIMIT 1;
        
        -- Herhangi bir takım için özel ayar varsa onu kullan
        IF v_team_enabled IS NOT NULL THEN
            RETURN v_team_enabled;
        END IF;
    END IF;
    
    -- Hiçbir özel ayar bulunamadı, varsayılan değeri kullan
    RETURN v_default_value;
END;
$$;

-- 10. Uygulama Ayarı Belirleme Fonksiyonu
CREATE OR REPLACE FUNCTION set_app_setting(
    p_admin_id INTEGER,
    p_key VARCHAR,
    p_value JSONB,
    p_description TEXT DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT FALSE
) RETURNS TABLE(
    id INTEGER,
    key VARCHAR,
    value JSONB,
    description TEXT,
    is_public BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_app_setting_id INTEGER;
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
        RAISE EXCEPTION 'Yetersiz yetki: Uygulama ayarı belirlemek için admin olmalısınız.';
    END IF;
    
    -- Ayarı ekle/güncelle
    INSERT INTO app_settings (key, value, description, is_public, created_by, updated_by)
    VALUES (p_key, p_value, p_description, p_is_public, p_admin_id, p_admin_id)
    ON CONFLICT (key) DO UPDATE
    SET 
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, app_settings.description),
        is_public = EXCLUDED.is_public,
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by
    RETURNING id INTO v_app_setting_id;
    
    RETURN QUERY
    SELECT as.id, as.key, as.value, as.description, as.is_public, as.updated_at, as.updated_by
    FROM app_settings as
    WHERE as.id = v_app_setting_id;
END;
$$;

-- 11. Arka Plan İşi Durumu Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_background_job_status(
    p_job_id INTEGER,
    p_status VARCHAR,
    p_result JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_retry BOOLEAN DEFAULT FALSE
) RETURNS TABLE(
    id INTEGER,
    job_type VARCHAR,
    status VARCHAR,
    retry_count INTEGER,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_max_retries INTEGER;
    v_retry_count INTEGER;
    v_job_type VARCHAR;
BEGIN
    -- Mevcut iş bilgilerini al
    SELECT job_type, retry_count, max_retries
    INTO v_job_type, v_retry_count, v_max_retries
    FROM background_jobs
    WHERE id = p_job_id;
    
    IF v_job_type IS NULL THEN
        RAISE EXCEPTION 'Arka plan işi bulunamadı.';
    END IF;
    
    -- Duruma göre işlem yap
    CASE
        WHEN p_status = 'completed' THEN
            UPDATE background_jobs
            SET 
                status = p_status,
                result = p_result,
                completed_at = NOW()
            WHERE id = p_job_id;
        
        WHEN p_status = 'failed' THEN
            -- Yeniden deneme
            IF p_retry = TRUE AND v_retry_count < v_max_retries THEN
                UPDATE background_jobs
                SET 
                    status = 'pending',
                    error_message = p_error_message,
                    retry_count = retry_count + 1,
                    next_retry_at = NOW() + (pow(2, retry_count) * INTERVAL '1 minute') -- exponential backoff
                WHERE id = p_job_id;
            ELSE
                -- Başarısız olarak işaretle
                UPDATE background_jobs
                SET 
                    status = p_status,
                    error_message = p_error_message,
                    completed_at = NOW()
                WHERE id = p_job_id;
            END IF;
        
        WHEN p_status = 'processing' THEN
            UPDATE background_jobs
            SET 
                status = p_status,
                started_at = COALESCE(started_at, NOW())
            WHERE id = p_job_id;
        
        ELSE
            UPDATE background_jobs
            SET status = p_status
            WHERE id = p_job_id;
    END CASE;
    
    RETURN QUERY
    SELECT bj.id, bj.job_type, bj.status, bj.retry_count, bj.next_retry_at, bj.completed_at
    FROM background_jobs bj
    WHERE bj.id = p_job_id;
END;
$$; 