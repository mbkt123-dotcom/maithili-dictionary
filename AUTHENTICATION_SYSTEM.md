# Secure Session-Based Authentication System

## Overview

A complete email/password authentication system with secure password hashing, session management, and optional OAuth support.

## Features

### ✅ Email/Password Authentication
- Secure password hashing using bcrypt (12 rounds)
- Password strength validation
- Email validation
- Session-based authentication using NextAuth.js

### ✅ User Registration
- Signup page with form validation
- Automatic account creation
- Auto sign-in after registration
- Password strength requirements

### ✅ User Login
- Email/password login form
- OAuth login options (Google, Facebook, Twitter)
- Session management
- Remember me functionality (30-day sessions)

### ✅ Security Features
- Password hashing with bcrypt (12 salt rounds)
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- JWT-based sessions
- Secure session storage
- Account status checking (active/inactive)

## File Structure

```
lib/auth/
  ├── config.ts          # NextAuth configuration
  └── password.ts       # Password hashing utilities

app/
  ├── login/
  │   └── page.tsx      # Login page (email/password + OAuth)
  ├── signup/
  │   └── page.tsx      # Signup page
  └── api/
      └── auth/
          ├── [...nextauth]/route.ts  # NextAuth API route
          └── signup/route.ts         # Signup API endpoint
```

## Usage

### Sign Up

1. Navigate to `/signup`
2. Fill in the form:
   - Email (required)
   - Password (required, must meet strength requirements)
   - Confirm Password (required)
   - Full Name (optional)
3. Click "Create Account"
4. You'll be automatically signed in and redirected to the dashboard

### Sign In

1. Navigate to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### Password Requirements

Passwords must:
- Be at least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)
- Contain at least one special character (!@#$%^&*()_+-=[]{}|;':",./<>?)

## API Endpoints

### POST `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `409` - Email already exists
- `500` - Server error

### POST `/api/auth/[...nextauth]`

NextAuth.js authentication endpoint. Handles:
- Credentials authentication (email/password)
- OAuth authentication (Google, Facebook, Twitter)
- Session management

## Security Considerations

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Passwords are never stored in plain text
- Password hashes are stored in the database

### Session Management
- JWT-based sessions (30-day expiration)
- Sessions are stored securely
- Automatic session refresh

### Account Security
- Inactive accounts cannot sign in
- OAuth accounts cannot use password login
- Email validation on signup

### Best Practices
- Always use HTTPS in production
- Set secure `NEXTAUTH_SECRET` (32+ characters)
- Regularly update dependencies
- Monitor for suspicious activity

## Environment Variables

Required:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key"
```

Optional (for OAuth):
```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```

## Database Schema

The authentication system uses these models:
- `User` - User accounts
- `Account` - OAuth account links
- `Session` - Active sessions
- `VerificationToken` - Email verification tokens

## Testing

### Create a Test Account

1. Go to `http://localhost:3000/signup`
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `Test1234!`
   - Name: `Test User`
3. Click "Create Account"
4. You should be automatically signed in

### Test Login

1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Sign In"
4. You should be redirected to the dashboard

## Troubleshooting

### "Invalid email or password"
- Check that the email is correct
- Verify the password is correct
- Ensure the account exists and is active

### "Password does not meet requirements"
- Check password strength requirements
- Ensure all requirements are met

### "An account with this email already exists"
- The email is already registered
- Try signing in instead
- Or use password reset if available

### Session Issues
- Clear browser cookies
- Check `NEXTAUTH_SECRET` is set correctly
- Verify `NEXTAUTH_URL` matches your application URL

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Account lockout after failed attempts
- [ ] Password expiration
- [ ] Login history tracking

