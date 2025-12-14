# Test Users - All Roles

This document contains the credentials for test users created for each role in the system.

## Default Password
**Password for all users:** `Test1234!`

---

## User Credentials

### 1. PUBLIC User
- **Email:** `public@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnphq0000qb5jof3fbcuw`
- **Role:** PUBLIC
- **Full Name:** Public User

### 2. FIELD_RESEARCHER User
- **Email:** `researcher@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnpi10001qb5jzn3bmztd`
- **Role:** FIELD_RESEARCHER
- **Full Name:** Field Researcher

### 3. EDITOR User
- **Email:** `editor@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnpi40002qb5jl83hvtv0`
- **Role:** EDITOR
- **Full Name:** Editor

### 4. SENIOR_EDITOR User
- **Email:** `senior.editor@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnpi60003qb5jhxpo75vt`
- **Role:** SENIOR_EDITOR
- **Full Name:** Senior Editor

### 5. EDITOR_IN_CHIEF User
- **Email:** `editor.in.chief@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnpi90004qb5jbbymesq1`
- **Role:** EDITOR_IN_CHIEF
- **Full Name:** Editor in Chief

### 6. ADMIN User
- **Email:** `admin@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnpie0005qb5jxoge89s9`
- **Role:** ADMIN
- **Full Name:** Administrator

### 7. SUPER_ADMIN User
- **Email:** `superadmin@maithili.test`
- **Password:** `Test1234!`
- **User ID:** `cmiglnpih0006qb5jzi01xus1`
- **Role:** SUPER_ADMIN
- **Full Name:** Super Administrator

---

## Quick Reference Table

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| PUBLIC | public@maithili.test | Test1234! | cmiglnphq0000qb5jof3fbcuw |
| FIELD_RESEARCHER | researcher@maithili.test | Test1234! | cmiglnpi10001qb5jzn3bmztd |
| EDITOR | editor@maithili.test | Test1234! | cmiglnpi40002qb5jl83hvtv0 |
| SENIOR_EDITOR | senior.editor@maithili.test | Test1234! | cmiglnpi60003qb5jhxpo75vt |
| EDITOR_IN_CHIEF | editor.in.chief@maithili.test | Test1234! | cmiglnpi90004qb5jbbymesq1 |
| ADMIN | admin@maithili.test | Test1234! | cmiglnpie0005qb5jxoge89s9 |
| SUPER_ADMIN | superadmin@maithili.test | Test1234! | cmiglnpih0006qb5jzi01xus1 |

---

## How to Use

1. Navigate to `http://localhost:3000/login`
2. Enter any of the email addresses above
3. Enter password: `Test1234!`
4. Click "Sign In"
5. You'll be redirected to the dashboard with the appropriate role permissions

## Recreating Users

If you need to recreate these users, run:

```bash
npm run db:seed:users
```

This will create or update all test users with the same credentials.

## Security Note

⚠️ **Important:** These are test users for development only. Do NOT use these credentials in production. Change all passwords before deploying to production.

---

## Role Permissions Overview

- **PUBLIC:** Basic access, can view published words
- **FIELD_RESEARCHER:** Can create and submit words
- **EDITOR:** Can review and edit words
- **SENIOR_EDITOR:** Can approve words from editors
- **EDITOR_IN_CHIEF:** Can approve words from senior editors
- **ADMIN:** Full access to manage dictionaries, parameters, and users
- **SUPER_ADMIN:** Complete system access, can manage everything including other admins

