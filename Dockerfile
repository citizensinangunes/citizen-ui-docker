FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Dependencies'leri yükle
RUN npm ci --only=production && npm cache clean --force

# Uygulama kodlarını kopyala
COPY . .

# Next.js'i build et
RUN npm run build

# Port'u expose et
EXPOSE 3000

# Development için
CMD ["npm", "run", "dev"] 