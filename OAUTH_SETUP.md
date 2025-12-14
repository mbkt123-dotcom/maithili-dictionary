# OAuth Setup Guide

This guide will help you set up OAuth authentication for the Maithili Dictionary Platform.

## Prerequisites

- A Google account (for Google OAuth)
- A Facebook Developer account (for Facebook OAuth - optional)
- A Twitter Developer account (for Twitter OAuth - optional)

## Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

4. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file:
     ```
     GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
     GOOGLE_CLIENT_SECRET="your-client-secret"
     ```

## Facebook OAuth Setup (Optional)

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Create a new app or use an existing one

2. **Add Facebook Login**
   - Go to "Add Product" > "Facebook Login" > "Set Up"
   - Configure OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/callback/facebook` (for development)
     - `https://yourdomain.com/api/auth/callback/facebook` (for production)

3. **Get App ID and Secret**
   - Go to "Settings" > "Basic"
   - Copy App ID and App Secret
   - Add them to your `.env.local` file:
     ```
     FACEBOOK_CLIENT_ID="your-app-id"
     FACEBOOK_CLIENT_SECRET="your-app-secret"
     ```

## Twitter OAuth Setup (Optional)

1. **Go to Twitter Developer Portal**
   - Visit: https://developer.twitter.com/
   - Create a new app

2. **Configure OAuth Settings**
   - Go to "App Settings" > "User authentication settings"
   - Add callback URLs:
     - `http://localhost:3000/api/auth/callback/twitter` (for development)
     - `https://yourdomain.com/api/auth/callback/twitter` (for production)

3. **Get API Keys**
   - Copy Client ID and Client Secret
   - Add them to your `.env.local` file:
     ```
     TWITTER_CLIENT_ID="your-client-id"
     TWITTER_CLIENT_SECRET="your-client-secret"
     ```

## Environment Variables

Make sure your `.env.local` file includes:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key"

# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth (Optional)
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"

# Twitter OAuth (Optional)
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

## Generate NEXTAUTH_SECRET

You can generate a secure secret using:

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use an online generator:**
- Visit: https://generate-secret.vercel.app/32

## Database Migration

After setting up OAuth, run the database migration to create the required NextAuth tables:

```bash
npm run db:migrate
```

Or if you prefer to push the schema directly:

```bash
npx prisma db push
```

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Click "Continue with Google" (or other provider)

4. You should be redirected to the OAuth provider's login page

5. After successful authentication, you'll be redirected back to the dashboard

## Troubleshooting

### "Configuration" Error
- Check that your OAuth credentials are correctly set in `.env.local`
- Verify that the redirect URIs match exactly (including http/https and trailing slashes)
- Make sure `NEXTAUTH_URL` matches your application URL

### "OAuthAccountNotLinked" Error
- This means an account with the same email already exists
- The user needs to sign in with the original provider they used

### Provider Not Showing
- Check that the provider's credentials are set in `.env.local`
- The login page only shows providers that have valid credentials

### Database Errors
- Make sure you've run the database migration: `npm run db:migrate`
- Verify your `DATABASE_URL` is correct in `.env.local`

## Production Setup

For production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URIs to your OAuth apps
3. Use secure, randomly generated `NEXTAUTH_SECRET`
4. Ensure your database is properly configured
5. Test the authentication flow thoroughly

