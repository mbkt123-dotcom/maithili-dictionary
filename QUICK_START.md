# Quick Start Guide

## Starting the Development Server

### Step 1: Navigate to Project
```bash
cd C:\Users\DeLL\maithili-dictionary
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Wait for Server to Start
Look for this message in the terminal:
```
✓ Ready in Xs
○ Local:        http://localhost:3000
```

### Step 4: Open in Browser
Open your browser and go to:
```
http://localhost:3000
```

## If You Get "Connection Refused"

### Quick Fix
1. **Stop all Node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Wait 10-15 seconds** for compilation

4. **Check terminal** for any error messages

5. **Try accessing:** http://localhost:3000

### Common Issues

#### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
# Then access http://localhost:3001
```

#### Compilation Errors
Check terminal output. Common fixes:
- Run `npm install` if dependencies missing
- Check for TypeScript errors
- Verify database connection

#### Database Connection
```bash
# Test database connection
$env:PGPASSWORD="p@ssword"
psql -U postgres -d maithili_dict -c "SELECT 1;"
```

## Verification

Once server is running, you should see:
- Terminal shows "Ready" message
- Browser opens http://localhost:3000
- Home page loads with search bar

## Next Steps

1. ✅ Server running on http://localhost:3000
2. ✅ Browse words at http://localhost:3000/words
3. ✅ Search at http://localhost:3000/search
4. ✅ Login at http://localhost:3000/login
5. ✅ Dashboard at http://localhost:3000/dashboard

## Troubleshooting

If issues persist, see `TROUBLESHOOTING.md` for detailed solutions.

