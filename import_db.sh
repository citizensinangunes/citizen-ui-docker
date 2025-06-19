#!/bin/bash

# Bu script veritabanı kurulumunu db/ klasöründeki script'e yönlendirir
# Bu, daha iyi organize edilmiş bir yapı sağlar

echo "🔄 Veritabanı kurulumu db/import_db.sh scripti ile başlatılıyor..."
echo ""

# db klasörüne geç ve kurulum scriptini çalıştır
cd db && ./import_db.sh

# Sonucu kontrol et
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Veritabanı kurulumu başarıyla tamamlandı!"
    echo "🚀 Artık 'npm run dev' komutu ile uygulamayı başlatabilirsiniz."
else
    echo ""
    echo "❌ Veritabanı kurulumu sırasında bir hata oluştu."
    echo "🔧 Lütfen hata mesajlarını kontrol edin ve gerekli düzeltmeleri yapın."
    exit 1
fi 