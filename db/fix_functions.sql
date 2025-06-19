-- create_site fonksiyonunu düzelt
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
    SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.subdomain, 
        s.site_uuid, 
        s.status, 
        s.owner_id, 
        s.team_id, 
        s.created_at
    FROM sites s
    WHERE s.id = v_site_id;
END;
$$;

-- add_domain fonksiyonunu düzelt
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
    SELECT 
        d.id, 
        d.site_id, 
        d.domain_name, 
        d.is_primary, 
        d.verification_status, 
        d.created_at
    FROM domains d
    WHERE d.id = v_domain_id;
END;
$$; 