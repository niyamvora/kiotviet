# 🚀 Complete Setup Guide - KiotViet Dashboard

## Step 1: Set Up Supabase Database

### 1.1 Go to Your Supabase Project

- Visit: https://supabase.com/dashboard
- Open your project: https://tfwerkakfgqmkskojgcj.supabase.co

### 1.2 Run the Database Schema

1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. **Copy the entire contents** of `supabase-schema.sql` file
4. **Paste it** into the SQL editor
5. Click **"Run"** button (or press Ctrl/Cmd + Enter)
6. You should see: **"Success. No rows returned"**

This creates:

- ✅ `user_credentials` table (stores KiotViet API keys)
- ✅ `user_preferences` table (stores theme/language settings)
- ✅ `api_cache` table (for caching API responses)
- ✅ `activity_logs` table (for tracking user actions)
- ✅ All security policies and indexes

## Step 2: Install Dependencies

```bash
cd /Users/niyamvora/Downloads/Code/kietviet
npm install
```

## Step 3: Verify Environment Variables

Check that your `.env.local` file contains:

```env
# KiotViet API Credentials
KIOTVIET_CLIENT_ID=761c0672-a038-4c85-9c2e-11890aacc5d2
KIOTVIET_SECRET_KEY=59D98EA30A4F6B4B80EAA2F099904A8AB3906C23

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tfwerkakfgqmkskojgcj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmd2Vya2FrZmdxbWtza29qZ2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzA4MDUsImV4cCI6MjA3MjA0NjgwNX0.8-4E4xBaaebL5fZXWN5w_KzqzdUF8qOOhtl9UB7cSzg
```

## Step 4: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## Step 5: Test the Application

### 5.1 Create Account

1. Go to http://localhost:3000 → redirects to `/auth/login`
2. Click **"Sign up"**
3. Enter your details:
   - **Full Name**: Your Name
   - **Email**: your@email.com
   - **Password**: yourpassword123
   - **Confirm Password**: yourpassword123
4. Click **"Create Account"**

### 5.2 Check Email Confirmation (if required)

- Check your email for confirmation link
- Click the link to verify your account
- Return to http://localhost:3000

### 5.3 Sign In

1. Go to `/auth/login`
2. Enter your email and password
3. Click **"Sign In"**
4. You should be redirected to `/dashboard`

### 5.4 Explore Demo Data

- You'll see demo data initially
- All features work with sample data
- Charts, metrics, and filters are functional

### 5.5 Add Real KiotViet Data (Optional)

1. Go to **Settings** (gear icon in sidebar)
2. Enter your KiotViet credentials:
   - **Client ID**: `761c0672-a038-4c85-9c2e-11890aacc5d2`
   - **Secret Key**: `59D98EA30A4F6B4B80EAA2F099904A8AB3906C23`
   - **Shop Name**: `chezbebe` (or your actual shop name)
3. Click **"Save Settings"**
4. Dashboard will now show live data from your KiotViet store

## Step 6: Test All Features

### ✅ Authentication

- [x] Sign up with email/password
- [x] Sign in/sign out
- [x] Protected routes

### ✅ Dashboard Features

- [x] Key metrics cards (revenue, orders, customers, products)
- [x] Interactive charts (line, pie, bar, area)
- [x] Filter tabs (overview, sales, products, customers, orders)
- [x] Timeline filters (week, month, year, all time)

### ✅ Theme & Language

- [x] Dark/Light mode toggle
- [x] English/Vietnamese language switch
- [x] Settings persistence

### ✅ Settings

- [x] KiotViet API credentials management
- [x] Theme preferences
- [x] Language preferences
- [x] Connection status

### ✅ AI Panel

- [x] Slide-out drawer (right side)
- [x] Chat interface mockup
- [x] Ready for AI integration

## Common Issues & Solutions

### Issue 1: "Failed to authenticate"

**Solution:** Run the SQL schema in Supabase first

### Issue 2: "Type does not exist" error in SQL

**Solution:** The schema has been fixed - copy the updated version

### Issue 3: Charts not loading

**Solution:** This is normal - charts use mock data initially

### Issue 4: Can't save KiotViet credentials

**Solution:** Ensure database schema was run successfully

## Production Deployment (Vercel)

1. Push code to GitHub (see GitHub setup below)
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## File Structure

```
kietviet/
├── 📁 app/                    # Next.js App Router
│   ├── auth/                  # Authentication pages
│   ├── dashboard/            # Protected dashboard
│   ├── globals.css           # Global styles
│   └── layout.tsx           # Root layout
├── 📁 components/            # React components
│   ├── dashboard/           # Dashboard components
│   ├── providers/           # Context providers
│   └── ui/                  # shadcn components
├── 📁 lib/                  # Utilities
│   ├── supabase.ts         # Client-side Supabase
│   ├── supabase-server.ts  # Server-side Supabase
│   ├── kiotviet-api.ts     # KiotViet API service
│   └── utils.ts            # Helper functions
├── 📁 hooks/               # Custom hooks
├── supabase-schema.sql     # Database schema
├── .env.local             # Environment variables
└── README.md              # Documentation
```

## 🎉 Success!

If you can:

1. ✅ Sign up and sign in
2. ✅ See the dashboard with demo data
3. ✅ Toggle dark/light mode
4. ✅ Switch between English/Vietnamese
5. ✅ Save settings

**Your KiotViet Dashboard is working perfectly!** 🚀
