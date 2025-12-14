# Troubleshooting Guide

## Connection Refused Error

If you're getting "connection refused" when trying to access http://localhost:3000, try these steps:

### 1. Check if Server is Running

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check Node.js processes
Get-Process -Name node -ErrorAction SilentlyContinue
```

### 2. Start Development Server

```bash
cd C:\Users\DeLL\maithili-dictionary
npm run dev
```

Wait for the message:
```
✓ Ready in Xs
○ Local:        http://localhost:3000
```

### 3. Common Issues

#### Port Already in Use
If port 3000 is already in use:
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

#### Compilation Errors
Check the terminal output for errors. Common issues:
- Missing dependencies: Run `npm install`
- TypeScript errors: Check `tsconfig.json`
- Import errors: Verify file paths

#### Database Connection Issues
If you see database errors:
```bash
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Test connection
psql -U postgres -d maithili_dict -c "SELECT 1;"
```

### 4. Verify Server is Accessible

Open browser and go to:
- http://localhost:3000
- http://127.0.0.1:3000

### 5. Check Firewall

Windows Firewall might be blocking the connection:
1. Open Windows Defender Firewall
2. Check if Node.js is allowed
3. Add exception if needed

### 6. Restart Everything

If nothing works:
```bash
# Stop all Node processes
taskkill /F /IM node.exe

# Clear Next.js cache
rm -r .next

# Reinstall dependencies
npm install

# Start server
npm run dev
```

### 7. Check Environment Variables

Make sure `.env.local` exists and has correct values:
```bash
# Verify .env.local exists
Test-Path .env.local

# Check DATABASE_URL
Get-Content .env.local | Select-String DATABASE_URL
```

### 8. Browser Issues

- Try different browser
- Clear browser cache
- Try incognito/private mode
- Check browser console for errors (F12)

## Quick Fixes

### Server Not Starting
```bash
# Kill existing processes
taskkill /F /IM node.exe

# Start fresh
npm run dev
```

### Port Conflict
```bash
# Use different port
npm run dev -- -p 3001
# Then access http://localhost:3001
```

### Build Errors
```bash
# Clean and rebuild
rm -r .next
npm run build
npm run dev
```

## Still Having Issues?

1. Check terminal output for specific error messages
2. Verify all dependencies are installed: `npm install`
3. Check database connection: `npm run db:studio`
4. Review error logs in terminal

