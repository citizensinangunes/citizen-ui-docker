# CitizenUI PostgreSQL Database

Bu klasör, CitizenUI projesi için gerekli olan PostgreSQL veritabanı şemalarını ve fonksiyonlarını içerir.

## Veritabanı Yapısı

Veritabanı aşağıdaki bileşenlerden oluşur:

- `schema.sql` - Tüm veritabanı tablolarını ve ilişkilerini içerir
- `functions.sql` - Temel kullanıcı yönetimi fonksiyonları
- `functions_site.sql` - Site yönetimi fonksiyonları
- `functions_deployment.sql` - Deployment yönetimi fonksiyonları
- `functions_access.sql` - Erişim kontrolü ve Docker fonksiyonları
- `functions_misc.sql` - Bildirim, webhook, sertifika ve davet fonksiyonları
- `functions_features.sql` - API, entegrasyon ve özellik bayrakları için fonksiyonlar
- `import_db.sh` - Tüm SQL dosyalarını PostgreSQL'e içe aktaran bash betiği

## Kurulum

### PostgreSQL Kurulumu

Eğer PostgreSQL yüklü değilse, işletim sisteminize göre aşağıdaki adımları izleyin:

#### macOS

```bash
brew install postgresql
brew services start postgresql
```

#### Windows

1. [PostgreSQL indirme sayfası](https://www.postgresql.org/download/windows/)ndan yükleyiciyi indirin
2. Yükleyiciyi çalıştırın ve kurulum adımlarını takip edin
3. Kurulum sırasında belirlediğiniz şifreyi not alın

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Veritabanı Oluşturma

1. Terminal/komut istemcisinde `db` klasörüne gidin:

```bash
cd /Users/ahmetsinangunes/Desktop/citizen-ui/db
```

2. İçe aktarma betiğini çalıştırılabilir yapın:

```bash
chmod +x import_db.sh
```

3. Betiği çalıştırın:

```bash
./import_db.sh
```

Bu betik:
- `citizenui` adında bir veritabanı oluşturur (eğer mevcutsa sorar ve onay üzerine yeniden oluşturur)
- Gerekli PostgreSQL eklentilerini etkinleştirir
- Şema ve tüm fonksiyon dosyalarını içe aktarır
- Temel rolleri ekler

## pgAdmin ile Bağlanma

[pgAdmin](https://www.pgadmin.org/) PostgreSQL veritabanları için popüler bir grafik arayüzüdür.

### pgAdmin Kurulumu

1. [pgAdmin indirme sayfası](https://www.pgadmin.org/download/)ndan işletim sisteminize uygun sürümü indirin ve kurun

### pgAdmin ile Veritabanına Bağlanma

1. pgAdmin uygulamasını başlatın
2. Sol panelde "Servers" üzerine sağ tıklayın ve "Register > Server" seçin
3. "General" sekmesinde sunucuya bir isim verin (örn. "Local CitizenUI")
4. "Connection" sekmesine geçin ve şu bilgileri girin:
   - Host: `localhost` veya `127.0.0.1`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres` (veya sizin belirlediğiniz kullanıcı adı)
   - Password: `postgres` (veya sizin belirlediğiniz şifre)
5. "Save" butonuna tıklayın

Bağlantı kurulduktan sonra sol panelde:
1. Servers > Local CitizenUI > Databases > citizenui > Schemas > public > Tables
yolunu izleyerek veritabanı tablolarını görebilirsiniz.

## Veritabanı Fonksiyonlarını Kullanma

pgAdmin üzerinden SQL sorguları çalıştırmak için:

1. Üst menüden "Tools > Query Tool" seçin veya `citizenui` veritabanına sağ tıklayıp "Query Tool" seçin
2. Açılan pencerede SQL sorgularınızı yazabilir ve çalıştırabilirsiniz.

Örnek bir sorgu:

```sql
-- Tüm kullanıcıları listeleme
SELECT * FROM users;

-- Fonksiyon kullanımı örneği - Yeni kullanıcı kaydetme
SELECT * FROM register_user('test@example.com', 'Test User', NULL, 'Test Organization');
```

## Bağlantı Parametrelerini Özelleştirme

`import_db.sh` dosyasındaki bağlantı parametrelerini kendi ortamınıza göre düzenleyebilirsiniz:

```bash
DB_NAME="citizenui"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"
``` 