import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu - Environment variables kullanarak
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'citizenui',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL bağlantısı için (production environment'lar için)
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Hataları log'la
pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı hatası:', err);
  process.exit(-1);
});

export default pool; 