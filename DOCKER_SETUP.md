# Docker Setup Instructions

## Docker Not Currently Installed

Docker is not currently installed on your system. To use the Docker Compose setup for PostgreSQL, Redis, and MinIO, you'll need to install Docker Desktop.

## Installation Steps

### 1. Install Docker Desktop for Windows

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Restart your computer if prompted
4. Launch Docker Desktop
5. Wait for Docker to start (you'll see a whale icon in the system tray)

### 2. Verify Installation

```powershell
docker --version
docker compose version
```

### 3. Start Services

Once Docker is installed, run:

```bash
cd C:\Users\DeLL\maithili-dictionary
docker compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **MinIO** on ports 9000, 9001

### 4. Verify Services Are Running

```bash
docker compose ps
```

### 5. View Logs (if needed)

```bash
docker compose logs -f
```

## Alternative: Manual PostgreSQL Installation

If you prefer not to use Docker, you can install PostgreSQL manually:

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL (remember the password you set)
3. Create a database:
   ```sql
   CREATE DATABASE maithili_dict;
   ```
4. Update `.env.local` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/maithili_dict"
   DIRECT_URL="postgresql://username:password@localhost:5432/maithili_dict"
   ```

## Alternative: SQLite (Quick Start)

For quick testing without installing PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   Remove the `directUrl` line.

2. Update `.env.local`:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

**Note**: SQLite has limitations and is not recommended for production. Some features may not work correctly.

## Current Status

- ✅ Environment variables configured
- ✅ Prisma client can be generated
- ⏳ Docker services need to be started (or PostgreSQL installed manually)
- ⏳ Database migrations pending (need database connection)

## Next Steps After Docker/PostgreSQL Setup

1. Start Docker services: `docker compose up -d`
2. Run migrations: `npm run db:migrate`
3. Seed data: `npm run db:seed`
4. Start dev server: `npm run dev`

