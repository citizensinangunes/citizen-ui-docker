#!/bin/bash

# Veritabanı bağlantı bilgileri - Environment variables'dan al veya default değerleri kullan
DB_NAME="${DB_NAME:-citizenui}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}CitizenUI Veritabanı Kurulum Scripti${NC}"
echo "========================================="
echo -e "${YELLOW}Bağlantı bilgileri:${NC}"
echo "  Veritabanı: $DB_NAME"
echo "  Kullanıcı: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "========================================="

# .env dosyası kontrolü
if [ ! -f "../.env.local" ] && [ ! -f "../.env" ]; then
    echo -e "${YELLOW}UYARI: .env.local veya .env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}Lütfen .env.example dosyasını kopyalayıp .env.local olarak kaydedin ve veritabanı bilgilerinizi güncelleyin.${NC}"
    echo ""
    echo -e "${BLUE}Örnek:${NC}"
    echo "  cp .env.example .env.local"
    echo ""
    read -p "Devam etmek istiyor musunuz? (E/h): " -r
    if [[ ! $REPLY =~ ^[EeYy]$ ]]; then
        echo -e "${RED}İşlem iptal edildi.${NC}"
        exit 1
    fi
fi

# PostgreSQL bağlantısını test et
echo -e "${YELLOW}PostgreSQL bağlantısı test ediliyor...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c '\q' 2>/dev/null; then
    echo -e "${RED}PostgreSQL bağlantısı başarısız!${NC}"
    echo -e "${RED}Lütfen aşağıdakileri kontrol edin:${NC}"
    echo "  1. PostgreSQL servisinin çalıştığından emin olun"
    echo "  2. Bağlantı bilgilerinin doğru olduğundan emin olun"
    echo "  3. Kullanıcının veritabanı oluşturma yetkisi olduğundan emin olun"
    echo ""
    echo -e "${BLUE}PostgreSQL kurulumu için:${NC}"
    echo "  macOS: brew install postgresql && brew services start postgresql"
    echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "  Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

echo -e "${GREEN}PostgreSQL bağlantısı başarılı!${NC}"

# Veritabanının varlığını kontrol et
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}Veritabanı '$DB_NAME' zaten mevcut. Silip yeniden oluşturmak istiyor musunuz? (E/h)${NC}"
    read -r response
    if [[ "$response" =~ ^([EeYy])$ ]]; then
        echo -e "${YELLOW}Veritabanı siliniyor...${NC}"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);"
        echo -e "${GREEN}Veritabanı silindi.${NC}"
    else
        echo -e "${YELLOW}İşlem iptal edildi. Çıkılıyor...${NC}"
        exit 0
    fi
fi

# Veritabanını oluştur
echo -e "${YELLOW}Veritabanı oluşturuluyor...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';"

if [ $? -ne 0 ]; then
    echo -e "${RED}Veritabanı oluşturulurken hata oluştu!${NC}"
    exit 1
fi

echo -e "${GREEN}Veritabanı başarıyla oluşturuldu.${NC}"

# Eklentileri etkinleştir
echo -e "${YELLOW}Gerekli eklentiler etkinleştiriliyor...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

# Şemaları içe aktar
echo -e "${YELLOW}Veritabanı şeması içe aktarılıyor...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/schema.sql"

if [ $? -ne 0 ]; then
    echo -e "${RED}Şema içe aktarılırken hata oluştu!${NC}"
    exit 1
fi

echo -e "${GREEN}Şema başarıyla içe aktarıldı.${NC}"

# Fonksiyonları içe aktar
echo -e "${YELLOW}Veritabanı fonksiyonları içe aktarılıyor...${NC}"

# Tüm function dosyalarını sırayla yükle
for func_file in functions.sql functions_site.sql functions_deployment.sql functions_access.sql functions_misc.sql functions_features.sql; do
    if [ -f "$(dirname "$0")/$func_file" ]; then
        echo -e "${YELLOW}  • $func_file yükleniyor...${NC}"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/$func_file"
        if [ $? -ne 0 ]; then
            echo -e "${RED}$func_file yüklenirken hata oluştu!${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}  • $func_file bulunamadı, atlanıyor...${NC}"
    fi
done

echo -e "${GREEN}Tüm fonksiyonlar başarıyla yüklendi.${NC}"

# Son kontroller
echo -e "${YELLOW}Kurulum doğrulanıyor...${NC}"
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
FUNCTION_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public';" | xargs)

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ CitizenUI veritabanı başarıyla kuruldu!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "${BLUE}İstatistikler:${NC}"
echo "  📊 Tablo sayısı: $TABLE_COUNT"
echo "  ⚙️  Fonksiyon sayısı: $FUNCTION_COUNT"
echo ""
echo -e "${BLUE}Bağlantı bilgileri:${NC}"
echo "  🔗 Host: $DB_HOST:$DB_PORT"
echo "  🗄️  Veritabanı: $DB_NAME"
echo "  👤 Kullanıcı: $DB_USER"
echo ""
echo -e "${YELLOW}Şimdi uygulamayı başlatabilirsiniz:${NC}"
echo "  cd .."
echo "  npm install"
echo "  npm run dev"
echo ""
echo -e "${GREEN}🎉 Kurulum tamamlandı!${NC}" 