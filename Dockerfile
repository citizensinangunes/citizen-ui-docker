FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Dependencies'leri yükle
RUN npm ci

# Uygulama kodlarını kopyala
COPY . .

# Next.js'i build et
RUN npm run build

# Port'u expose et
EXPOSE 3000

# Start in production mode
CMD ["npm", "start"] 