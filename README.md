This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Citizen UI

A modern web application for managing site deployments and configurations.

## 🐳 Super Quick Start (Recommended)

**Get everything running in 2 minutes with one command:**

```bash
git clone <repository-url>
cd citizen-ui
npm install
npm run start:full
```

**That's it!** 🎉 
- PostgreSQL automatically installed and configured
- Database schema and functions loaded automatically
- Application running at http://localhost:3000

### Requirements
Only **Docker** needed: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🔧 Manual Setup (Alternative)

If you prefer not to use Docker or want more control:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd citizen-ui
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database and application settings:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=citizenui
DB_PASSWORD=your_password_here
DB_PORT=5432
DB_SSL=false

# JWT Secret - Change this to a strong secret in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. PostgreSQL Setup

#### Option A: Local PostgreSQL Installation

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

#### Option B: Docker PostgreSQL Only

```bash
docker run --name citizenui-postgres \
  -e POSTGRES_DB=citizenui \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Database Initialization

Run the database setup script:

```bash
chmod +x import_db.sh
./import_db.sh
```

Or manually run from the db directory:

```bash
cd db
chmod +x import_db.sh
./import_db.sh
```

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎮 Available Commands

### Docker Commands (Recommended)
```bash
npm run start:full     # Start everything (PostgreSQL + App)
npm run docker:up      # Start in background
npm run docker:down    # Stop all services
npm run docker:logs    # View logs
npm run docker:reset   # Reset everything (including database)
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands (Manual setup)
```bash
npm run db:setup     # Setup database
npm run db:reset     # Reset database
```

## 📋 Setup Options Comparison

| Method | Setup Time | Requirements | Advantages |
|--------|------------|--------------|------------|
| **Docker (Recommended)** | 2 minutes | Only Docker | ✅ Fully automatic<br/>✅ Isolated environment<br/>✅ Easy cleanup |
| **Manual** | 5-10 minutes | PostgreSQL installed | ✅ More control<br/>✅ Use existing DB |

## 🗄️ Database Configuration

The application uses environment variables for database configuration. You can customize these in your `.env.local` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_NAME` | Database name | `citizenui` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_SSL` | Enable SSL connection | `false` |

## 🔐 Authentication Configuration

### Basic Authentication (Optional)

To protect your application with basic authentication:

```env
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USERNAME=your_username
BASIC_AUTH_PASSWORD=your_password
```

### JWT Configuration

Set a strong JWT secret for production:

```env
JWT_SECRET=your-super-secret-jwt-key-with-at-least-32-characters
```

## 📁 Project Structure

```
citizen-ui/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── lib/             # Utility libraries
│   └── types/           # TypeScript type definitions
├── db/                  # Database schema and functions
│   ├── schema.sql       # Database schema
│   ├── functions*.sql   # Database functions
│   ├── import_db.sh     # Database setup script
│   └── docker-init.sql  # Docker initialization
├── public/              # Static assets
├── docker-compose.yml   # Docker configuration
├── Dockerfile          # Container definition
└── .env.example         # Environment configuration template
```

## 🚀 Deployment

### Environment Variables for Production

Ensure these are set in your production environment:

```env
# Strong JWT secret
JWT_SECRET=your-production-jwt-secret

# Production database
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_SSL=true

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### Remote Database Setup

For production or remote databases:

1. Set `DB_SSL=true` for secure connections
2. Update `DB_HOST` to your remote database host
3. Ensure your database allows connections from your application server
4. Run the database setup script with your production credentials

## ✨ Features

- 🏗️ Site management and deployment tracking
- 🔧 Configuration variables management
- 👥 Team collaboration tools
- 🔒 SSL certificate management
- 📊 Analytics and monitoring
- 🐳 Docker container support
- 🔐 Authentication and authorization
- 📡 API and webhook integrations

## 🛠️ Troubleshooting

### Docker Issues

```bash
# Start Docker service
sudo systemctl start docker  # Linux
# or open Docker Desktop (Windows/Mac)

# Check port conflicts
docker-compose down
sudo lsof -i :5432  # PostgreSQL port
sudo lsof -i :3000  # App port
```

### Database Connection Issues (Manual setup)

1. **PostgreSQL not running:**
   ```bash
   # macOS
   brew services start postgresql
   
   # Ubuntu
   sudo systemctl start postgresql
   ```

2. **Wrong credentials:**
   - Verify your `.env.local` settings
   - Check if PostgreSQL user exists and has proper permissions

3. **Port conflicts:**
   - Default PostgreSQL port is 5432
   - Change `DB_PORT` in `.env.local` if using different port

### Application Issues

1. **Environment variables not loading:**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after changes

2. **Database schema out of date:**
   ```bash
   # Docker setup
   npm run docker:reset
   
   # Manual setup
   cd db && ./import_db.sh
   ```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the Docker logs: `npm run docker:logs`
3. Ensure all environment variables are properly set
4. Open an issue with detailed error information
