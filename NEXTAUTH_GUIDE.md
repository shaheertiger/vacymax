# 🔐 NextAuth.js Integration Guide

## Overview
NextAuth.js has been added to VacyMax for user authentication. Users can now:
- Create accounts with email/password
- Sign in with Google (optional)
- Save their vacation plans
- Access their plans across devices

---

## 📦 What Was Added

### **1. Dependencies**
- ✅ `next-auth@4.24.5` - Authentication library
- ✅ `bcryptjs@2.4.3` - Password hashing

### **2. API Endpoints**
- ✅ `/api/auth/[...nextauth].js` - NextAuth handler
- ✅ `/api/auth/register.js` - User registration

### **3. Database**
- ✅ `users` table added to Supabase schema

---

## 🔧 Setup Instructions

### **Step 1: Update Supabase Schema**

The schema has been updated with a `users` table. Re-run the SQL:

1. Go to: https://app.supabase.com/project/zlzzbuevvivmvtggyzew/sql
2. Copy the ENTIRE `supabase-schema.sql` file
3. Paste and Run

This will create the `users` table.

---

### **Step 2: Generate NextAuth Secret**

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Your generated secret:**
```
DLKF5cnR+RaBqNykZd752yxrXgJ5t8xnzk79BDbIU9g=
```

---

### **Step 3: Update Local .env File**

Add these lines to your `.env` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=DLKF5cnR+RaBqNykZd752yxrXgJ5t8xnzk79BDbIU9g=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional - add when ready)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### **Step 4: Add to Vercel Environment Variables**

Go to: https://vercel.com/marketing353/vacymax/settings/environment-variables

Add these variables (Production environment):

```
NEXTAUTH_SECRET=DLKF5cnR+RaBqNykZd752yxrXgJ5t8xnzk79BDbIU9g=
NEXTAUTH_URL=https://vacymax.vercel.app
```

**Optional - Google OAuth:**
```
GOOGLE_CLIENT_ID=(get from Google Cloud Console)
GOOGLE_CLIENT_SECRET=(get from Google Cloud Console)
```

---

## 🎯 How It Works

### **User Registration Flow**

```
User fills registration form
    ↓
POST /api/auth/register
    ↓
Password hashed with bcrypt
    ↓
User created in Supabase users table
    ↓
Success response
```

### **Login Flow**

```
User enters email/password
    ↓
POST /api/auth/signin
    ↓
NextAuth verifies credentials
    ↓
Password compared with hash
    ↓
JWT token created
    ↓
Session established
```

### **Google OAuth Flow** (Optional)

```
User clicks "Sign in with Google"
    ↓
Redirected to Google
    ↓
User authorizes
    ↓
Google redirects back
    ↓
NextAuth creates/finds user
    ↓
Session established
```

---

## 📊 Database Schema

### **users Table**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  provider TEXT DEFAULT 'credentials',
  provider_id TEXT,
  email_verified BOOLEAN DEFAULT false,
  image TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `email` - User's email address
- `name` - Display name
- `password_hash` - Bcrypt hashed password (null for OAuth users)
- `provider` - 'credentials' or 'google'
- `provider_id` - Google ID if OAuth
- `email_verified` - Email verification status
- `image` - Profile picture URL

---

## 🔌 API Endpoints

### **1. Register User**

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### **2. Sign In**

**Endpoint:** `POST /api/auth/signin`

NextAuth handles this automatically.

### **3. Sign Out**

**Endpoint:** `POST /api/auth/signout`

NextAuth handles this automatically.

### **4. Get Session**

**Endpoint:** `GET /api/auth/session`

Returns current user session.

---

## 🎨 Frontend Integration (Next Steps)

### **1. Create Auth Components**

You'll need to create:
- Sign In page (`/auth/signin`)
- Sign Up page (`/auth/signup`)
- User profile dropdown
- Protected routes

### **2. Use Session in React**

```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  
  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  
  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
```

### **3. Link Plans to Users**

Update `plan_generations` table to include `user_id`:

```sql
-- Add user_id foreign key
ALTER TABLE plan_generations 
ADD CONSTRAINT fk_user 
FOREIGN KEY (user_id) 
REFERENCES users(id);
```

---

## 🔒 Security Features

✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **JWT Tokens** - Secure session management  
✅ **HTTPS Only** - Cookies marked secure in production  
✅ **CSRF Protection** - Built into NextAuth  
✅ **Email Validation** - Prevents duplicate accounts  
✅ **Password Requirements** - Minimum 8 characters  

---

## 🌐 Google OAuth Setup (Optional)

### **1. Create Google OAuth App**

1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://vacymax.vercel.app/api/auth/callback/google` (prod)
7. Copy Client ID and Client Secret

### **2. Add to Environment Variables**

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🧪 Testing

### **Test Registration**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

### **Test Sign In**

Use NextAuth's built-in sign-in page:
```
http://localhost:3000/api/auth/signin
```

---

## 📋 Deployment Checklist

Before deploying with NextAuth:

- [ ] Run updated Supabase schema (includes `users` table)
- [ ] Add `NEXTAUTH_SECRET` to Vercel
- [ ] Add `NEXTAUTH_URL` to Vercel
- [ ] (Optional) Add Google OAuth credentials
- [ ] Test registration endpoint
- [ ] Test sign-in flow
- [ ] Verify session persistence
- [ ] Test sign-out

---

## 🚀 Next Steps

1. **Create Auth UI Components**
   - Sign in form
   - Sign up form
   - User profile dropdown

2. **Protect Routes**
   - Require auth for saving plans
   - Show saved plans for logged-in users

3. **Link Plans to Users**
   - Update plan generation to include user_id
   - Create "My Plans" page

4. **Add Email Verification** (Optional)
   - Send verification emails
   - Verify email before full access

5. **Add Password Reset** (Optional)
   - Forgot password flow
   - Reset password emails

---

## 📚 Resources

- **NextAuth Docs**: https://next-auth.js.org/
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2

---

## ✅ Current Status

- ✅ NextAuth configured
- ✅ User registration endpoint created
- ✅ Database schema updated
- ✅ Password hashing implemented
- ✅ Google OAuth ready (needs credentials)
- ⏳ Frontend UI components (next step)
- ⏳ Protected routes (next step)

---

**Ready to add authentication to your app!** 🔐
