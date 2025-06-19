-- CitizenUI Docker Initialization Script
-- Bu dosya Docker container'da PostgreSQL başladığında otomatik çalışır

\echo '🚀 CitizenUI Veritabanı otomatik kurulumu başlıyor...'

-- Gerekli eklentileri etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\echo '✅ PostgreSQL eklentileri etkinleştirildi'

-- Şemaları yükle
\i /docker-entrypoint-initdb.d/schema.sql
\echo '✅ Veritabanı şeması yüklendi'

-- Fonksiyonları yükle
\i /docker-entrypoint-initdb.d/functions.sql
\echo '✅ Temel fonksiyonlar yüklendi'

\i /docker-entrypoint-initdb.d/functions_site.sql
\echo '✅ Site yönetimi fonksiyonları yüklendi'

\i /docker-entrypoint-initdb.d/functions_deployment.sql
\echo '✅ Deployment fonksiyonları yüklendi'

\i /docker-entrypoint-initdb.d/functions_access.sql
\echo '✅ Erişim kontrolü fonksiyonları yüklendi'

\i /docker-entrypoint-initdb.d/functions_misc.sql
\echo '✅ Yardımcı fonksiyonlar yüklendi'

\i /docker-entrypoint-initdb.d/functions_features.sql
\echo '✅ Feature fonksiyonları yüklendi'

-- Temel rolleri ekle
INSERT INTO roles (name, description, is_system_role) VALUES 
('admin', 'System administrator', TRUE),
('citizen', 'Regular user', TRUE),
('external', 'External service user', TRUE),
('viewer', 'Read-only user', TRUE)
ON CONFLICT (name) DO NOTHING;

\echo '✅ Sistem rolleri oluşturuldu'

-- Veritabanı istatistiklerini göster
SELECT 
    (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as tablo_sayisi,
    (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public') as fonksiyon_sayisi;

\echo '🎉 CitizenUI veritabanı başarıyla hazırlandı!'
\echo '📊 Veritabanı kullanıma hazır - Uygulama başlatılıyor...' 