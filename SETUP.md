# 🚀 CitizenUI Hızlı Kurulum Rehberi

Bu dosya, projeyi GitHub'dan klonladıktan sonra hızlıca çalıştırabilmeniz için hazırlanmıştır.

## 🐳 Süper Hızlı Kurulum (2 dakika) - TAVSİYE EDİLEN

### Tek Komutla Çalıştır!

```bash
git clone <repository-url>
cd citizen-ui
npm install
npm run start:full
```

**Bu kadar!** 🎉

- PostgreSQL otomatik kurulur
- Veritabanı otomatik hazırlanır  
- Uygulama http://localhost:3000 adresinde başlar

### Gereksinimler

Sadece **Docker** yüklü olması yeterli:
- [Docker Desktop İndir](https://www.docker.com/products/docker-desktop/)

## ⚡ Manuel Kurulum (5 dakika)

Eğer Docker kullanmak istemiyorsanız:

### 1. Environment Dosyasını Oluşturun

```bash
cp .env.example .env.local
```

### 2. Veritabanı Bilgilerinizi Güncelleyin

`.env.local` dosyasını açın ve kendi PostgreSQL bilgilerinizi girin:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=citizenui
DB_PASSWORD=your_password_here
DB_PORT=5432
```

### 3. PostgreSQL'i Başlatın

**macOS (Homebrew):**
```bash
brew services start postgresql
```

**Ubuntu/Linux:**
```bash
sudo systemctl start postgresql
```

**Docker (Sadece PostgreSQL):**
```bash
docker run --name citizenui-postgres \
  -e POSTGRES_DB=citizenui \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Kurulumu Tamamlayın

```bash
npm install
npm run db:setup
npm run dev
```

### 5. Uygulamayı Açın

[http://localhost:3000](http://localhost:3000) adresine gidin.

## 🎮 Docker Komutları

```bash
# Tüm sistemi başlat (PostgreSQL + Uygulama)
npm run start:full

# Arka planda çalıştır
npm run docker:up

# Durdur
npm run docker:down

# Logları izle
npm run docker:logs

# Tamamen sıfırla (veritabanı dahil)
npm run docker:reset
```

## 🔧 Alternatif Kurulum

Eğer yukarıdaki adımlar işe yaramazsa:

### Manuel Veritabanı Kurulumu

```bash
# Veritabanını manuel oluştur
createdb citizenui

# Schema ve fonksiyonları yükle
cd db
./import_db.sh
```

### Environment Variables Kontrolü

```bash
# Veritabanı bağlantınızı test edin
psql -h localhost -U postgres -d citizenui -c "SELECT 1;"
```

## 🆘 Sorun Giderme

### Docker Problemleri

```bash
# Docker servisini başlat
sudo systemctl start docker  # Linux
# veya Docker Desktop'ı açın (Windows/Mac)

# Port çakışması varsa
docker-compose down
sudo lsof -i :5432  # PostgreSQL portu kontrolü
sudo lsof -i :3000  # App portu kontrolü
```

### PostgreSQL Çalışmıyor (Manuel kurulum)

```bash
# macOS
brew services restart postgresql

# Ubuntu
sudo systemctl restart postgresql

# Docker
docker start citizenui-postgres
```

### Bağlantı Hatası

1. `.env.local` dosyasındaki bilgileri kontrol edin
2. PostgreSQL kullanıcınızın veritabanı oluşturma yetkisi olduğundan emin olun
3. Port çakışması olmadığından emin olun (5432 portu boş olmalı)

### Veritabanı Şifre Problemi

```bash
# PostgreSQL kullanıcı şifresi ayarla
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

## 📝 Kurulum Seçenekleri Karşılaştırması

| Yöntem | Kurulum Süresi | Gereksinimler | Avantajlar |
|--------|----------------|---------------|------------|
| **Docker (Tavsiye)** | 2 dakika | Sadece Docker | ✅ Tam otomatik<br/>✅ İzole environment<br/>✅ Kolay temizlik |
| **Manuel** | 5-10 dakika | PostgreSQL kurulu | ✅ Daha fazla kontrol<br/>✅ Mevcut DB kullanımı |

## 📋 Kurulum Sonrası

- İlk çalıştırmada veritabanı otomatik olarak oluşturulur
- Tüm tablolar ve fonksiyonlar otomatik yüklenir
- Test verileri varsayılan olarak eklenmez

## 🔗 Yararlı Komutlar

```bash
# Veritabanını sıfırla
npm run db:reset          # Manuel kurulum
npm run docker:reset      # Docker kurulum

# Tabloları listele
psql -d citizenui -c "\dt"

# Fonksiyonları listele
psql -d citizenui -c "\df"

# Docker container'lara bağlan
docker exec -it citizenui-postgres psql -U postgres -d citizenui
```

## 🎯 Hangi Yöntemi Seçmeli?

- **Yeni başlayan, hızlıca test etmek istiyor** → 🐳 Docker
- **Development yapmak istiyor** → 🐳 Docker  
- **Production deployment** → 🔧 Manuel
- **Mevcut PostgreSQL var** → 🔧 Manuel

**🎉 Başarılı kurulum için tebrikler!** 