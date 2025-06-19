-- CitizenUI Database Functions
-- This file contains the complete database functions for the CitizenUI platform

-- KULLANICI YÖNETİMİ FONKSİYONLARI
-- 1. Kullanıcı Kayıt Fonksiyonu
CREATE OR REPLACE FUNCTION register_user(
    p_email VARCHAR,
    p_name VARCHAR,
    p_avatar_url VARCHAR DEFAULT NULL,
    p_organization VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    email VARCHAR,
    name VARCHAR
) LANGUAGE plpgsql AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    INSERT INTO users (email, name, avatar_url, organization)
    VALUES (p_email, p_name, p_avatar_url, p_organization)
    RETURNING id INTO v_user_id;
    
    -- Varsayılan citizen rolünü ata
    INSERT INTO user_roles (user_id, role_id)
    SELECT v_user_id, id FROM roles WHERE name = 'citizen';
    
    RETURN QUERY
    SELECT u.id, u.email, u.name
    FROM users u
    WHERE u.id = v_user_id;
END;
$$;

-- 2. Kullanıcı Kimlik Doğrulama Fonksiyonu
CREATE OR REPLACE FUNCTION authenticate_user(
    p_email VARCHAR,
    p_provider VARCHAR,
    p_provider_user_id VARCHAR,
    p_access_token TEXT,
    p_refresh_token TEXT DEFAULT NULL,
    p_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE(
    user_id INTEGER,
    session_id UUID,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR
) LANGUAGE plpgsql AS $$
DECLARE
    v_user_id INTEGER;
    v_session_uuid UUID := gen_random_uuid();
BEGIN
    -- Kullanıcıyı bul veya oluştur
    SELECT u.id INTO v_user_id
    FROM users u
    JOIN authentication a ON u.id = a.user_id
    WHERE a.provider = p_provider AND a.provider_user_id = p_provider_user_id;
    
    -- Kimlik bilgilerini güncelle veya ekle
    IF v_user_id IS NOT NULL THEN
        UPDATE authentication
        SET access_token = p_access_token,
            refresh_token = p_refresh_token,
            token_expires_at = p_token_expires_at,
            updated_at = NOW()
        WHERE user_id = v_user_id AND provider = p_provider;
        
        UPDATE users
        SET last_login_at = NOW()
        WHERE id = v_user_id;
    ELSE
        RAISE EXCEPTION 'Kullanıcı bulunamadı veya kimlik doğrulama başarısız';
    END IF;
    
    -- Yeni oturum oluştur
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (v_session_uuid, v_user_id, NOW() + INTERVAL '1 month');
    
    RETURN QUERY
    SELECT u.id, v_session_uuid, u.name, u.email, r.name as role
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.id = v_user_id
    LIMIT 1;
END;
$$;

-- 3. Kullanıcı Çıkış Fonksiyonu
CREATE OR REPLACE FUNCTION logout_user(
    p_session_id UUID
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    UPDATE sessions
    SET is_active = FALSE
    WHERE session_id = p_session_id;
    
    RETURN FOUND;
END;
$$;

-- 4. Oturum Doğrulama Fonksiyonu
CREATE OR REPLACE FUNCTION validate_session(
    p_session_id UUID
) RETURNS TABLE(
    is_valid BOOLEAN,
    user_id INTEGER,
    email VARCHAR,
    name VARCHAR,
    role VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as is_valid,
        u.id as user_id,
        u.email,
        u.name,
        r.name as role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE s.session_id = p_session_id
    AND s.is_active = TRUE
    AND s.expires_at > NOW()
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL, NULL, NULL, NULL;
    END IF;
END;
$$;

-- 5. Kullanıcı Profili Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id INTEGER,
    p_name VARCHAR DEFAULT NULL,
    p_avatar_url VARCHAR DEFAULT NULL,
    p_organization VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    email VARCHAR,
    name VARCHAR,
    avatar_url VARCHAR,
    organization VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users
    SET 
        name = COALESCE(p_name, name),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        organization = COALESCE(p_organization, organization),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.avatar_url, u.organization, u.updated_at
    FROM users u
    WHERE u.id = p_user_id;
END;
$$;

-- 6. Kullanıcı Rolü Değiştirme Fonksiyonu
CREATE OR REPLACE FUNCTION change_user_role(
    p_admin_id INTEGER,
    p_user_id INTEGER,
    p_role_name VARCHAR
) RETURNS TABLE(
    user_id INTEGER,
    user_name VARCHAR,
    role_name VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_admin_role VARCHAR;
    v_role_id INTEGER;
BEGIN
    -- Admin rolünü kontrol et
    SELECT r.name INTO v_admin_role
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.id = p_admin_id;
    
    IF v_admin_role <> 'admin' THEN
        RAISE EXCEPTION 'Yetersiz yetki: Kullanıcı rollerini değiştirmek için admin olmalısınız.';
    END IF;
    
    -- Hedef rolü bul
    SELECT id INTO v_role_id
    FROM roles
    WHERE name = p_role_name;
    
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Belirtilen rol bulunamadı.';
    END IF;
    
    -- Kullanıcının mevcut rolünü güncelle veya yeni rol ekle
    DELETE FROM user_roles WHERE user_id = p_user_id;
    
    INSERT INTO user_roles (user_id, role_id, assigned_at)
    VALUES (p_user_id, v_role_id, NOW());
    
    RETURN QUERY
    SELECT u.id, u.name, r.name, NOW()
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.id = p_user_id;
END;
$$;

-- 7. OAuth Giriş Fonksiyonu
CREATE OR REPLACE FUNCTION oauth_login(
    p_provider VARCHAR,
    p_provider_user_id VARCHAR,
    p_email VARCHAR,
    p_name VARCHAR,
    p_access_token TEXT,
    p_avatar_url VARCHAR DEFAULT NULL,
    p_refresh_token TEXT DEFAULT NULL,
    p_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE(
    user_id INTEGER,
    session_id UUID,
    name VARCHAR,
    email VARCHAR,
    is_new_user BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
    v_user_id INTEGER;
    v_is_new_user BOOLEAN := FALSE;
    v_session_uuid UUID := gen_random_uuid();
BEGIN
    -- Kullanıcıyı kimlik sağlayıcı bilgisine göre bul
    SELECT u.id INTO v_user_id
    FROM users u
    JOIN authentication a ON u.id = a.user_id
    WHERE a.provider = p_provider AND a.provider_user_id = p_provider_user_id;
    
    -- Kullanıcı yoksa, e-posta ile kontrol et
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id
        FROM users
        WHERE email = p_email;
        
        -- Kullanıcı hala yoksa yeni oluştur
        IF v_user_id IS NULL THEN
            INSERT INTO users (email, name, avatar_url)
            VALUES (p_email, p_name, p_avatar_url)
            RETURNING id INTO v_user_id;
            
            -- Varsayılan citizen rolünü ata
            INSERT INTO user_roles (user_id, role_id)
            SELECT v_user_id, id FROM roles WHERE name = 'citizen';
            
            v_is_new_user := TRUE;
        END IF;
        
        -- Kimlik bilgilerini ekle
        INSERT INTO authentication (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at)
        VALUES (v_user_id, p_provider, p_provider_user_id, p_access_token, p_refresh_token, p_token_expires_at);
    ELSE
        -- Kimlik bilgilerini güncelle
        UPDATE authentication
        SET access_token = p_access_token,
            refresh_token = p_refresh_token,
            token_expires_at = p_token_expires_at,
            updated_at = NOW()
        WHERE user_id = v_user_id AND provider = p_provider;
    END IF;
    
    -- Kullanıcı bilgilerini güncelle
    UPDATE users
    SET 
        name = p_name,
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    -- Yeni oturum oluştur
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (v_session_uuid, v_user_id, NOW() + INTERVAL '1 month');
    
    RETURN QUERY
    SELECT v_user_id, v_session_uuid, p_name, p_email, v_is_new_user;
END;
$$;

-- TAKIM YÖNETİMİ FONKSİYONLARI
-- 1. Takım Oluşturma Fonksiyonu
CREATE OR REPLACE FUNCTION create_team(
    p_user_id INTEGER,
    p_name VARCHAR,
    p_description TEXT,
    p_department VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    slug VARCHAR,
    department VARCHAR,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_team_id INTEGER;
    v_slug VARCHAR;
BEGIN
    -- Slug oluştur
    v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]', '-', 'g'));
    
    -- Takım oluştur
    INSERT INTO teams (name, description, slug, department, created_by)
    VALUES (p_name, p_description, v_slug, p_department, p_user_id)
    RETURNING id INTO v_team_id;
    
    -- Oluşturan kişiyi owner olarak ekle
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (v_team_id, p_user_id, 'owner');
    
    RETURN QUERY
    SELECT t.id, t.name, t.description, t.slug, t.department, t.created_by, t.created_at
    FROM teams t
    WHERE t.id = v_team_id;
END;
$$;

-- 2. Takım Üyesi Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION add_team_member(
    p_admin_id INTEGER,
    p_team_id INTEGER,
    p_user_id INTEGER,
    p_role team_member_role DEFAULT 'member'
) RETURNS TABLE(
    id INTEGER,
    team_id INTEGER,
    user_id INTEGER,
    role team_member_role,
    joined_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_admin_role team_member_role;
    v_member_id INTEGER;
BEGIN
    -- Admin'in yetki kontrolü
    SELECT role INTO v_admin_role
    FROM team_members
    WHERE team_id = p_team_id AND user_id = p_admin_id;
    
    IF v_admin_role IS NULL OR v_admin_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Yetersiz yetki: Takım üyesi eklemek için owner veya admin olmalısınız.';
    END IF;
    
    -- Kullanıcıyı takıma ekle
    INSERT INTO team_members (team_id, user_id, role, invited_by)
    VALUES (p_team_id, p_user_id, p_role, p_admin_id)
    ON CONFLICT (team_id, user_id) DO UPDATE
    SET role = p_role, invited_by = p_admin_id
    RETURNING id INTO v_member_id;
    
    RETURN QUERY
    SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.joined_at
    FROM team_members tm
    WHERE tm.id = v_member_id;
END;
$$;

-- 3. Takım Üyesi Çıkarma Fonksiyonu
CREATE OR REPLACE FUNCTION remove_team_member(
    p_admin_id INTEGER,
    p_team_id INTEGER,
    p_user_id INTEGER
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_admin_role team_member_role;
    v_user_role team_member_role;
BEGIN
    -- Admin'in yetki kontrolü
    SELECT role INTO v_admin_role
    FROM team_members
    WHERE team_id = p_team_id AND user_id = p_admin_id;
    
    IF v_admin_role IS NULL OR v_admin_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Yetersiz yetki: Takım üyesi çıkarmak için owner veya admin olmalısınız.';
    END IF;
    
    -- Çıkarılacak kullanıcının rolünü kontrol et
    SELECT role INTO v_user_role
    FROM team_members
    WHERE team_id = p_team_id AND user_id = p_user_id;
    
    -- Owner, owner'ı çıkaramaz (tek owner varsa)
    IF v_user_role = 'owner' AND v_admin_role != 'owner' THEN
        RAISE EXCEPTION 'Yetersiz yetki: Bir owner yalnızca başka bir owner tarafından çıkarılabilir.';
    END IF;
    
    -- Son owner'ı çıkaramazsın
    IF v_user_role = 'owner' THEN
        IF (SELECT COUNT(*) FROM team_members WHERE team_id = p_team_id AND role = 'owner') <= 1 THEN
            RAISE EXCEPTION 'Son owner takımdan çıkarılamaz. Önce başka bir owner atayın.';
        END IF;
    END IF;
    
    -- Üyeyi çıkar
    DELETE FROM team_members
    WHERE team_id = p_team_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- 4. Takım Bilgilerini Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_team(
    p_user_id INTEGER,
    p_team_id INTEGER,
    p_name VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_department VARCHAR DEFAULT NULL,
    p_avatar_url VARCHAR DEFAULT NULL
) RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    slug VARCHAR,
    department VARCHAR,
    avatar_url VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
DECLARE
    v_user_role team_member_role;
BEGIN
    -- Kullanıcının yetki kontrolü
    SELECT role INTO v_user_role
    FROM team_members
    WHERE team_id = p_team_id AND user_id = p_user_id;
    
    IF v_user_role IS NULL OR v_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Yetersiz yetki: Takım bilgilerini güncellemek için owner veya admin olmalısınız.';
    END IF;
    
    -- Takım bilgilerini güncelle
    UPDATE teams SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        department = COALESCE(p_department, department),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        updated_at = NOW()
    WHERE id = p_team_id;
    
    RETURN QUERY
    SELECT t.id, t.name, t.description, t.slug, t.department, t.avatar_url, t.updated_at
    FROM teams t
    WHERE t.id = p_team_id;
END;
$$; 