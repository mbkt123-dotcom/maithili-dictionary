# DevOps Environment Checklist

## ✅ Currently Available

- [x] **Node.js** v24.11.1 ✅
- [x] **npm** v11.6.2 ✅
- [x] **Git** v2.52.0 ✅

## ❌ Missing / Need to Install

### Required for Local Development

#### Option 1: Docker (Recommended for Easy Setup)
- [ ] **Docker Desktop** - Download from: https://www.docker.com/products/docker-desktop/
  - Includes Docker and Docker Compose
  - Provides: PostgreSQL, Redis, MinIO (S3-compatible storage) in containers
  - **Why needed**: Easy local database, cache, and file storage setup

#### Option 2: Manual Installation (Alternative)
- [ ] **PostgreSQL 15+** - Download from: https://www.postgresql.org/download/windows/
  - **Why needed**: Primary database for all application data
  - **Alternative**: Use SQLite for initial development (not recommended for production features)

- [ ] **Redis 7+** - Download from: https://redis.io/download
  - **Why needed**: Session storage, caching, job queues
  - **Windows alternative**: Use WSL2 or Memurai (Windows Redis port)

- [ ] **File Storage** - Local filesystem (no installation needed)
  - Store files in `./storage` directory locally
  - Can migrate to S3/MinIO later

### Recommended Development Tools

- [ ] **VS Code** - https://code.visualstudio.com/
  - Recommended extensions:
    - Prisma
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - TypeScript and JavaScript Language Features

- [ ] **PostgreSQL GUI Tool** (Optional but helpful)
  - pgAdmin: https://www.pgadmin.org/
  - DBeaver: https://dbeaver.io/
  - TablePlus: https://tableplus.com/

- [ ] **Redis GUI Tool** (Optional)
  - RedisInsight: https://redis.com/redis-enterprise/redis-insight/
  - Another Redis Desktop Manager: https://github.com/qishibo/AnotherRedisDesktopManager

### Package Manager (Optional but Recommended)

- [ ] **pnpm** - Faster and more efficient than npm
  ```bash
  npm install -g pnpm
  ```
- OR
- [ ] **yarn** - Alternative to npm
  ```bash
  npm install -g yarn
  ```

## Development Environment Setup Options

### Option A: Docker Setup (Easiest - Recommended)

**Prerequisites:**
1. Install Docker Desktop
2. Start Docker Desktop
3. Run `docker-compose up -d` in project root

**Services provided:**
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO (S3-compatible) on ports 9000, 9001

**Advantages:**
- No manual installation needed
- Isolated environment
- Easy to reset/clean
- Consistent across team

### Option B: Manual Installation

**Steps:**
1. Install PostgreSQL
   - Create database: `maithili_dict`
   - Note username, password, port (default: 5432)

2. Install Redis
   - Start Redis server
   - Note port (default: 6379)

3. Use local file storage
   - Create `./storage` directory
   - Files stored locally

**Advantages:**
- More control
- Better for production-like testing
- No Docker overhead

### Option C: Hybrid (Development without Docker)

**For Quick Start:**
- Use SQLite for database (Prisma supports it)
- Skip Redis (use in-memory sessions)
- Use local file storage

**Limitations:**
- Some features may not work (Redis-dependent)
- Need to migrate to PostgreSQL later
- Not production-ready

## Next Steps

1. **Choose setup option** (A, B, or C)
2. **Install required tools**
3. **Run project setup commands**
4. **Configure environment variables**
5. **Start development server**

## Verification Commands

After installation, verify:

```bash
# Check Node.js
node --version  # Should be v18+ or v20+

# Check npm
npm --version

# Check Git
git --version

# Check Docker (if using Option A)
docker --version
docker-compose --version

# Check PostgreSQL (if using Option B)
psql --version

# Check Redis (if using Option B)
redis-cli --version
```

## Project-Specific Requirements

Once tools are installed, the project will need:

1. **Database connection string** (PostgreSQL or SQLite)
2. **Redis connection** (if using Redis)
3. **File storage path** (local directory)
4. **OAuth app credentials** (for social login - can be added later)
5. **Email service** (optional for local dev - can use console logging)




