-- SİTE YÖNETİMİ FONKSİYONLARI

-- 5. Site Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_site(
    p_user_id INTEGER,
    p_name VARCHAR,
    p_description TEXT,
    p_subdomain VARCHAR,
    p_team_id INTEGER DEFAULT NULL,
    p_framework_id INTEGER DEFAULT NULL,
    p_language VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    subdomain VARCHAR,
    site_uuid UUID,
    status site_status,
    owner_id INTEGER,
    team_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_team_member_role team_member_role;
BEGIN
    -- Takım kontrolü
    IF p_team_id IS NOT NULL THEN
        SELECT role INTO v_team_member_role
        FROM team_members
        WHERE team_id = p_team_id AND user_id = p_user_id;
        
        IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
            RAISE EXCEPTION 'Yetersiz yetki: Takım adına site oluşturmak için owner veya admin olmalısınız.';
        END IF;
    END IF;
    
    -- Site oluştur
    INSERT INTO sites (
        name, 
        description, 
        subdomain, 
        owner_id, 
        team_id, 
        framework_id, 
        language
    )
    VALUES (
        p_name, 
        p_description, 
        p_subdomain, 
        p_user_id, 
        p_team_id, 
        p_framework_id, 
        p_language
    )
    RETURNING id INTO v_site_id;
    
    -- Varsayılan site yapılandırması
    INSERT INTO site_configuration (site_id)
    VALUES (v_site_id);
    
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.subdomain, s.site_uuid, s.status, s.owner_id, s.team_id, s.created_at
    FROM sites s
    WHERE s.id = v_site_id;
END;
$$;

-- 6. Site Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_site(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_status site_status DEFAULT NULL,
    p_framework_id INTEGER DEFAULT NULL,
    p_language VARCHAR DEFAULT NULL,
    p_repository_url VARCHAR DEFAULT NULL,
    p_branch VARCHAR DEFAULT NULL,
    p_auto_deploy BOOLEAN DEFAULT NULL,
    p_visibility VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    status site_status,
    framework_id INTEGER,
    language VARCHAR,
    repository_url VARCHAR,
    branch VARCHAR,
    auto_deploy BOOLEAN,
    visibility VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
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
                RAISE EXCEPTION 'Yetersiz yetki: Bu siteyi güncellemek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu siteyi güncellemek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Site güncelleme
    UPDATE sites SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        status = COALESCE(p_status, status),
        framework_id = COALESCE(p_framework_id, framework_id),
        language = COALESCE(p_language, language),
        repository_url = COALESCE(p_repository_url, repository_url),
        branch = COALESCE(p_branch, branch),
        auto_deploy = COALESCE(p_auto_deploy, auto_deploy),
        visibility = COALESCE(p_visibility, visibility),
        updated_at = NOW()
    WHERE id = p_site_id;
    
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.status, s.framework_id, s.language, 
           s.repository_url, s.branch, s.auto_deploy, s.visibility, s.updated_at
    FROM sites s
    WHERE s.id = p_site_id;
END;
$$;

-- 7. Site Yapılandırması Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_site_configuration(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_build_command VARCHAR DEFAULT NULL,
    p_start_command VARCHAR DEFAULT NULL,
    p_install_command VARCHAR DEFAULT NULL,
    p_output_directory VARCHAR DEFAULT NULL,
    p_root_directory VARCHAR DEFAULT NULL,
    p_node_version VARCHAR DEFAULT NULL,
    p_npm_version VARCHAR DEFAULT NULL,
    p_auto_deploy BOOLEAN DEFAULT NULL,
    p_headers JSONB DEFAULT NULL,
    p_redirects JSONB DEFAULT NULL,
    p_rewrites JSONB DEFAULT NULL,
    p_https_only BOOLEAN DEFAULT NULL,
    p_environment_variables JSONB DEFAULT NULL,
    p_build_cache_enabled BOOLEAN DEFAULT NULL,
    p_preview_deployments_enabled BOOLEAN DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    build_command VARCHAR,
    start_command VARCHAR,
    install_command VARCHAR,
    output_directory VARCHAR,
    root_directory VARCHAR,
    node_version VARCHAR,
    npm_version VARCHAR,
    auto_deploy BOOLEAN,
    https_only BOOLEAN,
    build_cache_enabled BOOLEAN,
    preview_deployments_enabled BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_config_id INTEGER;
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
                RAISE EXCEPTION 'Yetersiz yetki: Bu sitenin yapılandırmasını güncellemek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu sitenin yapılandırmasını güncellemek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Mevcut yapılandırmayı kontrol et
    SELECT id INTO v_config_id FROM site_configuration WHERE site_id = p_site_id;
    
    -- Eğer yapılandırma yoksa oluştur
    IF v_config_id IS NULL THEN
        INSERT INTO site_configuration (site_id) VALUES (p_site_id)
        RETURNING id INTO v_config_id;
    END IF;
    
    -- Yapılandırmayı güncelle
    UPDATE site_configuration SET
        build_command = COALESCE(p_build_command, build_command),
        start_command = COALESCE(p_start_command, start_command),
        install_command = COALESCE(p_install_command, install_command),
        output_directory = COALESCE(p_output_directory, output_directory),
        root_directory = COALESCE(p_root_directory, root_directory),
        node_version = COALESCE(p_node_version, node_version),
        npm_version = COALESCE(p_npm_version, npm_version),
        auto_deploy = COALESCE(p_auto_deploy, auto_deploy),
        headers = COALESCE(p_headers, headers),
        redirects = COALESCE(p_redirects, redirects),
        rewrites = COALESCE(p_rewrites, rewrites),
        https_only = COALESCE(p_https_only, https_only),
        environment_variables = COALESCE(p_environment_variables, environment_variables),
        build_cache_enabled = COALESCE(p_build_cache_enabled, build_cache_enabled),
        preview_deployments_enabled = COALESCE(p_preview_deployments_enabled, preview_deployments_enabled),
        updated_at = NOW()
    WHERE site_id = p_site_id;
    
    RETURN QUERY
    SELECT sc.id, sc.site_id, sc.build_command, sc.start_command, sc.install_command,
           sc.output_directory, sc.root_directory, sc.node_version, sc.npm_version,
           sc.auto_deploy, sc.https_only, sc.build_cache_enabled, 
           sc.preview_deployments_enabled, sc.updated_at
    FROM site_configuration sc
    WHERE sc.site_id = p_site_id;
END;
$$;

-- 8. Domain Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION add_domain(
    p_user_id INTEGER,
    p_site_id INTEGER,
    p_domain_name VARCHAR,
    p_is_primary BOOLEAN DEFAULT FALSE
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    domain_name VARCHAR,
    is_primary BOOLEAN,
    verification_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_domain_id INTEGER;
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
                RAISE EXCEPTION 'Yetersiz yetki: Bu siteye domain eklemek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu siteye domain eklemek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Domain ekleme
    INSERT INTO domains (site_id, domain_name, is_primary, dns_records)
    VALUES (
        p_site_id, 
        p_domain_name, 
        p_is_primary, 
        json_build_object(
            'CNAME', 'verify.citizenui.dev',
            'TXT', 'site-verification=' || encode(gen_random_bytes(16), 'hex')
        )
    )
    RETURNING id INTO v_domain_id;
    
    -- Eğer ana domain ise diğer domainleri güncelle
    IF p_is_primary THEN
        UPDATE domains
        SET is_primary = FALSE
        WHERE site_id = p_site_id AND id <> v_domain_id;
    END IF;
    
    RETURN QUERY
    SELECT d.id, d.site_id, d.domain_name, d.is_primary, d.verification_status, d.created_at
    FROM domains d
    WHERE d.id = v_domain_id;
END;
$$;

-- 9. Domain Silme Fonksiyonu
CREATE OR REPLACE FUNCTION remove_domain(
    p_user_id INTEGER,
    p_domain_id INTEGER
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
    v_is_primary BOOLEAN;
BEGIN
    -- Domain'in site ID'sini ve primary olup olmadığını al
    SELECT d.site_id, d.is_primary INTO v_site_id, v_is_primary
    FROM domains d
    WHERE d.id = p_domain_id;
    
    IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'Domain bulunamadı.';
    END IF;
    
    -- Site sahibi ve takım kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = v_site_id;
    
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Bu siteye ait domain silmek için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu siteye ait domain silmek için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Ana domain'i silmeye çalışıyorsa ve başka domain varsa hata ver
    IF v_is_primary AND (SELECT COUNT(*) FROM domains WHERE site_id = v_site_id) > 1 THEN
        RAISE EXCEPTION 'Ana domaini silmeden önce başka bir domaini ana domain olarak ayarlamalısınız.';
    END IF;
    
    -- Domain'i sil
    DELETE FROM domains
    WHERE id = p_domain_id;
    
    RETURN TRUE;
END;
$$;

-- 10. Domain Doğrulama Fonksiyonu (Simülasyon)
CREATE OR REPLACE FUNCTION verify_domain(
    p_user_id INTEGER,
    p_domain_id INTEGER
) RETURNS TABLE(
    id INTEGER,
    site_id INTEGER,
    domain_name VARCHAR,
    is_primary BOOLEAN,
    verification_status VARCHAR,
    verified_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_site_id INTEGER;
    v_site_owner_id INTEGER;
    v_site_team_id INTEGER;
    v_team_member_role team_member_role;
BEGIN
    -- Domain'in site ID'sini al
    SELECT d.site_id INTO v_site_id
    FROM domains d
    WHERE d.id = p_domain_id;
    
    IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'Domain bulunamadı.';
    END IF;
    
    -- Site sahibi ve takım kontrolü
    SELECT owner_id, team_id INTO v_site_owner_id, v_site_team_id
    FROM sites
    WHERE id = v_site_id;
    
    IF v_site_owner_id <> p_user_id THEN
        -- Takım üzerinden yetki kontrolü
        IF v_site_team_id IS NOT NULL THEN
            SELECT role INTO v_team_member_role
            FROM team_members
            WHERE team_id = v_site_team_id AND user_id = p_user_id;
            
            IF v_team_member_role IS NULL OR v_team_member_role NOT IN ('owner', 'admin') THEN
                RAISE EXCEPTION 'Yetersiz yetki: Bu domaini doğrulamak için site sahibi veya takım yöneticisi olmalısınız.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Yetersiz yetki: Bu domaini doğrulamak için site sahibi olmalısınız.';
        END IF;
    END IF;
    
    -- Domain'i doğrula (gerçek uygulamada burada DNS kontrolü yapılır)
    UPDATE domains
    SET verification_status = 'verified', verified_at = NOW()
    WHERE id = p_domain_id;
    
    RETURN QUERY
    SELECT d.id, d.site_id, d.domain_name, d.is_primary, d.verification_status, d.verified_at
    FROM domains d
    WHERE d.id = p_domain_id;
END;
$$; 