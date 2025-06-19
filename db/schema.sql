-- CitizenUI Database Schema
-- This file contains the complete database schema for the CitizenUI platform

-- Ana veri tipleri
CREATE TYPE user_role AS ENUM ('admin', 'citizen', 'external', 'viewer');
CREATE TYPE site_status AS ENUM ('active', 'building', 'error', 'maintenance');
CREATE TYPE team_member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE site_access_level AS ENUM ('admin', 'write', 'read');
CREATE TYPE deployment_status AS ENUM ('queued', 'building', 'success', 'error', 'cancelled');
CREATE TYPE notification_event_type AS ENUM ('deploy_success', 'deploy_fail', 'domain_expire');
CREATE TYPE webhook_event_type AS ENUM ('deploy_start', 'deploy_success', 'deploy_fail');

-- Kullanıcılar ve Kimlik Doğrulama
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    organization VARCHAR(255),
    billing_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

CREATE TABLE authentication (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Takımlar ve Üyelik
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(255),
    department VARCHAR(255),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role team_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(team_id, user_id)
);

-- Siteler ve Yapılandırma
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    site_uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    status site_status DEFAULT 'active',
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    framework_id INTEGER,
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_deployed_at TIMESTAMP WITH TIME ZONE,
    repository_url VARCHAR(255),
    branch VARCHAR(100) DEFAULT 'main',
    auto_deploy BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(50) DEFAULT 'public'
);

CREATE TABLE site_configuration (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
    build_command VARCHAR(255),
    start_command VARCHAR(255),
    install_command VARCHAR(255),
    output_directory VARCHAR(255) DEFAULT 'dist',
    root_directory VARCHAR(255),
    node_version VARCHAR(20) DEFAULT '18.x',
    npm_version VARCHAR(20),
    auto_deploy BOOLEAN DEFAULT TRUE,
    headers JSONB DEFAULT '{}',
    redirects JSONB DEFAULT '[]',
    rewrites JSONB DEFAULT '[]',
    https_only BOOLEAN DEFAULT TRUE,
    environment_variables JSONB DEFAULT '{}',
    build_cache_enabled BOOLEAN DEFAULT TRUE,
    preview_deployments_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    dns_records JSONB DEFAULT '{}',
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, domain_name)
);

-- Frameworks ve Dağıtımlar
CREATE TABLE frameworks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    language VARCHAR(50),
    description TEXT,
    logo_url VARCHAR(255),
    documentation_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    commit_hash VARCHAR(100),
    commit_message TEXT,
    branch VARCHAR(100) DEFAULT 'main',
    status deployment_status DEFAULT 'queued',
    started_at TIMESTAMP WITH TIME ZONE,
    deployed_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    build_log TEXT,
    error_message TEXT,
    is_production BOOLEAN DEFAULT TRUE,
    is_auto_deployment BOOLEAN DEFAULT FALSE,
    deployment_url VARCHAR(255),
    build_time INTEGER,
    is_rollback BOOLEAN DEFAULT FALSE,
    rollback_from_id INTEGER REFERENCES deployments(id) ON DELETE SET NULL,
    build_settings JSONB DEFAULT '{}',
    environment_variables JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE deployment_metadata (
    id SERIAL PRIMARY KEY,
    deployment_id INTEGER REFERENCES deployments(id) ON DELETE CASCADE UNIQUE,
    dependencies JSONB DEFAULT '{}',
    build_output JSONB,
    bundle_size BIGINT,
    framework_version VARCHAR(50),
    performance_score JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE config_vars (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    environment VARCHAR(50) DEFAULT 'production',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, key, environment)
);

-- Logging ve Metrikler
CREATE TABLE log_entries (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    deployment_id INTEGER REFERENCES deployments(id) ON DELETE SET NULL,
    log_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) NOT NULL,
    level VARCHAR(20) DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    instance_id VARCHAR(100)
);

CREATE TABLE site_metrics (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uptime_percentage REAL,
    performance_status VARCHAR(20),
    response_time_ms INTEGER,
    cpu_usage REAL,
    memory_usage BIGINT,
    storage_usage BIGINT,
    visitors_count INTEGER,
    page_views INTEGER,
    unique_visitors INTEGER,
    bounce_rate REAL,
    avg_session_duration INTEGER,
    geo_distribution JSONB DEFAULT '{}',
    device_breakdown JSONB DEFAULT '{}',
    browser_breakdown JSONB DEFAULT '{}'
);

-- Site Takım Erişimi
CREATE TABLE site_team_access (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    access_level site_access_level NOT NULL DEFAULT 'read',
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, team_id)
);

-- Docker Konteyner ve İmajlar
CREATE TABLE docker_images (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    repository VARCHAR(255) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    image_id VARCHAR(100) NOT NULL,
    digest VARCHAR(255),
    size BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    architecture VARCHAR(50),
    layers JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE docker_containers (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    docker_image_id INTEGER REFERENCES docker_images(id) ON DELETE SET NULL,
    container_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'running',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stopped_at TIMESTAMP WITH TIME ZONE,
    ports JSONB DEFAULT '{}',
    env_variables JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE docker_volume_mounts (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    container_id INTEGER REFERENCES docker_containers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mount_path VARCHAR(255) NOT NULL,
    size BIGINT,
    type VARCHAR(50) DEFAULT 'volume',
    persistent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Metrik Geçmişi
CREATE TABLE site_metrics_history (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hourly_metrics JSONB DEFAULT '{}',
    daily_summary JSONB DEFAULT '{}',
    total_requests INTEGER DEFAULT 0,
    total_bandwidth BIGINT DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, date)
);

-- Preview Ortamları
CREATE TABLE preview_environments (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    commit_hash VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    url VARCHAR(255) NOT NULL,
    basic_auth_username VARCHAR(100),
    basic_auth_password VARCHAR(100),
    environment_variables JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_expire BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Bildirimler ve Webhooks
CREATE TABLE email_notifications (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    event_type notification_event_type NOT NULL,
    recipients JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    template_id VARCHAR(100),
    custom_message JSONB,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_deliveries (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER REFERENCES email_notifications(id) ON DELETE CASCADE,
    delivery_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20),
    recipient VARCHAR(255),
    delivery_details JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0
);

CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    secret_token VARCHAR(255),
    event_types webhook_event_type[] NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    headers JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SSL Sertifikaları
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    certificate_data TEXT,
    private_key TEXT,
    issue_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    last_renewal_attempt TIMESTAMP WITH TIME ZONE,
    renewal_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Davetler
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- İzinler
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_type, action)
);

CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Kaynak Limitleri
CREATE TABLE resource_limits (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    max_bandwidth_gb REAL,
    max_storage_gb REAL,
    max_sites INTEGER,
    max_domains INTEGER,
    max_builds_per_day INTEGER,
    max_container_memory REAL,
    max_container_cpu REAL,
    max_concurrent_builds INTEGER,
    max_preview_environments INTEGER,
    has_analytics BOOLEAN DEFAULT FALSE,
    api_rate_limit INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Anahtarları
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    key_hash TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    scopes TEXT[] NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Entegrasyonlar
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE feature_flags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    default_value BOOLEAN DEFAULT FALSE,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_feature_flags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature_flag_id INTEGER REFERENCES feature_flags(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_flag_id)
);

CREATE TABLE team_feature_flags (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    feature_flag_id INTEGER REFERENCES feature_flags(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, feature_flag_id)
);

-- Uygulama Ayarları
CREATE TABLE app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Arka Plan İşleri
CREATE TABLE background_jobs (
    id SERIAL PRIMARY KEY,
    job_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payload JSONB NOT NULL,
    result JSONB,
    error_message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0
);

-- Indexler
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_sites_owner_id ON sites(owner_id);
CREATE INDEX idx_sites_team_id ON sites(team_id);
CREATE INDEX idx_sites_subdomain ON sites(subdomain);
CREATE INDEX idx_domains_site_id ON domains(site_id);
CREATE INDEX idx_site_configuration_site_id ON site_configuration(site_id);
CREATE INDEX idx_deployments_site_id ON deployments(site_id);
CREATE INDEX idx_deployments_user_id ON deployments(user_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_created_at ON deployments(created_at);
CREATE INDEX idx_deployment_metadata_deployment_id ON deployment_metadata(deployment_id);
CREATE INDEX idx_config_vars_site_id ON config_vars(site_id);
CREATE INDEX idx_config_vars_key ON config_vars(key);
CREATE INDEX idx_log_entries_site_id ON log_entries(site_id);
CREATE INDEX idx_log_entries_deployment_id ON log_entries(deployment_id);
CREATE INDEX idx_log_entries_timestamp ON log_entries(log_timestamp);
CREATE INDEX idx_log_entries_level ON log_entries(level);
CREATE INDEX idx_site_metrics_site_id ON site_metrics(site_id);
CREATE INDEX idx_site_metrics_collected_at ON site_metrics(collected_at);
CREATE INDEX idx_site_team_access_site_id ON site_team_access(site_id);
CREATE INDEX idx_site_team_access_team_id ON site_team_access(team_id);
CREATE INDEX idx_docker_images_site_id ON docker_images(site_id);
CREATE INDEX idx_docker_containers_site_id ON docker_containers(site_id);
CREATE INDEX idx_docker_containers_image_id ON docker_containers(docker_image_id);
CREATE INDEX idx_docker_volume_mounts_site_id ON docker_volume_mounts(site_id);
CREATE INDEX idx_docker_volume_mounts_container_id ON docker_volume_mounts(container_id);
CREATE INDEX idx_site_metrics_history_site_id ON site_metrics_history(site_id);
CREATE INDEX idx_site_metrics_history_date ON site_metrics_history(date);
CREATE INDEX idx_preview_environments_site_id ON preview_environments(site_id);
CREATE INDEX idx_preview_environments_status ON preview_environments(status);
CREATE INDEX idx_email_notifications_site_id ON email_notifications(site_id);
CREATE INDEX idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX idx_webhooks_site_id ON webhooks(site_id);
CREATE INDEX idx_certificates_site_id ON certificates(site_id);
CREATE INDEX idx_certificates_domain_id ON certificates(domain_id);
CREATE INDEX idx_certificates_domain ON certificates(domain);
CREATE INDEX idx_certificates_expiry_date ON certificates(expiry_date);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_team_id ON invitations(team_id);
CREATE INDEX idx_invitations_site_id ON invitations(site_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_resource_limits_site_id ON resource_limits(site_id);
CREATE INDEX idx_resource_limits_team_id ON resource_limits(team_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_team_id ON integrations(team_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_user_feature_flags_user_id ON user_feature_flags(user_id);
CREATE INDEX idx_user_feature_flags_feature_flag_id ON user_feature_flags(feature_flag_id);
CREATE INDEX idx_team_feature_flags_team_id ON team_feature_flags(team_id);
CREATE INDEX idx_team_feature_flags_feature_flag_id ON team_feature_flags(feature_flag_id);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_job_type ON background_jobs(job_type); 