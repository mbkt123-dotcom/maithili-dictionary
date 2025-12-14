# Maithili Dictionary - Setup Guide

## Quick Start (Choose Your Path)

### Path 1: Docker Setup (Recommended)

**Prerequisites:**
- Docker Desktop installed and running

**Steps:**
`ash
# 1. Navigate to project
cd maithili-dictionary

# 2. Start services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# 3. Install dependencies
npm install

# 4. Set up environment variables
copy .env.example .env.local
# Edit .env.local with your settings

# 5. Run database migrations
npm run db:migrate

# 6. Generate Prisma client
npm run db:generate

# 7. (Optional) Seed database
npm run db:seed

# 8. Start development server
npm run dev
`

### Path 2: Manual Installation

**Prerequisites:**
- PostgreSQL 15+ installed and running
- Redis 7+ installed and running (optional, can skip for basic dev)

**Steps:**
`ash
# 1. Install PostgreSQL and create database
# Using psql:
psql -U postgres
CREATE DATABASE maithili_dict;
\q

# 2. Install Redis (optional)
# Start Redis server:
redis-server

# 3. Install dependencies
npm install

# 4. Set up environment variables
copy .env.example .env.local
# Edit .env.local:
# - Update DATABASE_URL with your PostgreSQL credentials
# - Update REDIS_URL if using Redis
# - Set other required variables

# 5. Run database migrations
npm run db:migrate

# 6. Generate Prisma client
npm run db:generate

# 7. (Optional) Seed database
npm run db:seed

# 8. Start development server
npm run dev
`

### Path 3: Quick Start (SQLite - Minimal Setup)

**For quick testing without installing PostgreSQL/Redis:**

`ash
# 1. Install dependencies
npm install

# 2. Set up environment variables
copy .env.example .env.local
# Edit .env.local to use SQLite:
# DATABASE_URL="file:./dev.db"

# 3. Run database migrations
npm run db:migrate

# 4. Generate Prisma client
npm run db:generate

# 5. Start development server
npm run dev
`

**Note:** Some features (Redis-dependent) won't work with this setup.

## Environment Variables

Create .env.local file with:

`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/maithili_dict"
# OR for SQLite: DATABASE_URL="file:./dev.db"

# Redis (optional for local dev)
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers (can be added later)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
INSTAGRAM_CLIENT_ID=""
INSTAGRAM_CLIENT_SECRET=""
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""

# File Storage (local)
STORAGE_PATH="./storage"
STORAGE_URL="http://localhost:3000/storage"

# Email (optional for local dev - can use console)
EMAIL_FROM="noreply@localhost"

# Search (optional - can add later)
ALGOLIA_APP_ID=""
ALGOLIA_API_KEY=""
ALGOLIA_SEARCH_KEY=""

# App
APP_ENV="development"
APP_URL="http://localhost:3000"
`

## Generate NEXTAUTH_SECRET

`powershell
# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
`

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Check firewall/port access

### Redis Connection Issues
- Verify Redis is running
- Check REDIS_URL format
- Can skip Redis for basic development (sessions will use database)

### Port Already in Use
- Change port in 
ext.config.js or use -p 3001 flag
- Check if another Next.js app is running

### Prisma Issues
- Run 
pm run db:generate after schema changes
- Run 
pm run db:migrate to apply migrations
- Check Prisma schema syntax

## Development Workflow

1. **Start services** (Docker or manual)
2. **Start dev server**: 
pm run dev
3. **Open browser**: http://localhost:3000
4. **Database GUI**: Run 
pm run db:studio for Prisma Studio

## Next Steps After Setup

1. ✅ Verify all services are running
2. ✅ Check database connection
3. ✅ Test authentication (once OAuth is configured)
4. ✅ Create first dictionary entry
5. ✅ Test word entry workflow
