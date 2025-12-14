# Next Steps - Getting Started

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
cd C:\Users\DeLL\maithili-dictionary
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:
```bash
copy .env.example .env.local
```

Edit `.env.local` and configure:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Same as DATABASE_URL for migrations
- `NEXTAUTH_SECRET` - Generate a secret key (see below)
- `NEXTAUTH_URL` - http://localhost:3000

**Optional (for OAuth):**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`
- `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET`

### 3. Generate NEXTAUTH_SECRET

On Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`.

### 4. Start Docker Services (Recommended)

If using Docker Compose:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on ports 9000, 9001

### 5. Run Database Migrations

```bash
npm run db:migrate
```

This will:
- Create all database tables
- Set up relationships
- Create indexes

### 6. Generate Prisma Client

```bash
npm run db:generate
```

### 7. Seed Initial Data (Optional)

```bash
npm run db:seed
```

This creates:
- Main dictionary (MLRC)
- Default parameter definitions (meaning, etymology, examples, usage)

### 8. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 📋 Database Connection Strings

### Docker Compose (Default)
```
DATABASE_URL="postgresql://maithili:maithili123@localhost:5432/maithili_dict"
DIRECT_URL="postgresql://maithili:maithili123@localhost:5432/maithili_dict"
```

### Manual PostgreSQL Installation
```
DATABASE_URL="postgresql://username:password@localhost:5432/maithili_dict"
DIRECT_URL="postgresql://username:password@localhost:5432/maithili_dict"
```

### SQLite (Quick Start - Not Recommended for Production)
```
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
```

Note: Update `prisma/schema.prisma` datasource to use `sqlite` instead of `postgresql` if using SQLite.

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Check firewall/port access

### Prisma Issues
- Run `npm run db:generate` after schema changes
- Run `npm run db:migrate` to apply migrations
- Check Prisma schema syntax

### NextAuth Issues
- Ensure NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your app URL
- Check OAuth provider credentials (if using)

### Port Already in Use
- Change port: `npm run dev -- -p 3001`
- Or kill process using port 3000

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:seed          # Seed initial data
npm run db:reset         # Reset database (dev only)
```

## 🎯 What's Next?

After completing the setup:

1. **Test the application**
   - Visit http://localhost:3000
   - Verify the home page loads

2. **Test database connection**
   - Run `npm run db:studio`
   - Verify tables are created

3. **Set up authentication** (optional for now)
   - Configure OAuth providers
   - Test login flow

4. **Start building features**
   - Create UI components
   - Build API routes
   - Implement word entry forms

## 📖 Documentation

- [SETUP_STATUS.md](./SETUP_STATUS.md) - Current setup status
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Complete project plan
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup guide
- [DEVOPS_CHECKLIST.md](./DEVOPS_CHECKLIST.md) - Environment requirements

## ⚠️ Important Notes

1. **Instagram OAuth**: Not a standard NextAuth provider. Requires custom setup if needed.

2. **Database**: PostgreSQL is recommended. SQLite can be used for quick testing but has limitations.

3. **Environment Variables**: Never commit `.env.local` to version control.

4. **Dependencies**: All required dependencies are listed in `package.json`. Run `npm install` to install them.

5. **TypeScript**: The project uses TypeScript. Ensure your IDE is configured for TypeScript support.

