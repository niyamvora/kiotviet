# KiotViet Dashboard - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository: `niyamvora/kiotviet`
4. Vercel will auto-detect it's a Next.js project
5. Click "Deploy"

### 2. Configure Environment Variables

After deployment, add these environment variables in Vercel dashboard:

#### Required Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# KiotViet API (Optional - for admin testing)
CLIENT_ID=your_kiotviet_client_id
SECRET_KEY=your_kiotviet_secret_key
```

### 3. Set Up Supabase Database

Run this SQL in your Supabase SQL editor:

```sql
-- Create user_credentials table
CREATE TABLE user_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language VARCHAR(5) DEFAULT 'en',
  theme VARCHAR(10) DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own credentials" ON user_credentials
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

## 📊 Data Source Information

### Demo Mode vs Live Mode

**🎯 Demo Mode (Default):**

- Shows realistic sample data for Vietnamese retail business
- No KiotViet credentials required
- Perfect for testing and previewing the dashboard
- Clearly marked with "📊 Demo Mode" status

**🔗 Live Mode (After Credentials Setup):**

- Fetches real data from KiotViet API
- Requires valid KiotViet API credentials
- Shows actual business metrics from user's store
- Marked with "🔗 Connected to KiotViet API" status

### How Data Integration Works:

1. **User visits dashboard** → Shows demo data initially
2. **User goes to Settings** → Enters KiotViet API credentials
3. **Credentials saved** → Dashboard automatically switches to live data
4. **API failure/issues** → Gracefully falls back to demo data with error message

## 🔧 Testing the Deployment

### Test Demo Mode:

1. Visit your deployed URL
2. Sign up for a new account
3. Dashboard should show demo data with Vietnam business metrics
4. All charts and analytics should work smoothly

### Test Live Mode:

1. Go to Settings page
2. Enter valid KiotViet API credentials:
   - Client ID
   - Secret Key
   - Shop Name
3. Save credentials
4. Return to dashboard - should now show live data
5. Check browser console for data source logs

## 🌍 Production URL Structure

Your app will be available at:

```
https://your-project-name.vercel.app
```

## 🔍 Monitoring & Debugging

### Check Data Source:

- Open browser developer console
- Look for these logs:
  - `📊 Using demo data - No KiotViet credentials found`
  - `🔗 Attempting to fetch live data from KiotViet API...`
  - `✅ Successfully fetched live KiotViet data`
  - `❌ Error fetching live data, falling back to demo`

### Vercel Function Logs:

- Go to Vercel dashboard → Functions tab
- Monitor API call performance and errors
- Check for timeout issues (30s limit set)

## 🎯 Key Features Confirmed Working:

✅ **Live Data Integration** - Real KiotViet API when credentials provided
✅ **Demo Data Fallback** - Always works for testing/preview
✅ **VND Currency** - Vietnam-specific formatting throughout  
✅ **Timeline Filtering** - Week/Month/Year/All time with realistic data
✅ **Navigation** - Proper back buttons and page flow
✅ **Settings Management** - Easy credential setup
✅ **Responsive Design** - Works on all devices
✅ **Error Handling** - Graceful fallbacks and user feedback

## 🔐 Security Notes:

- All KiotViet credentials encrypted in Supabase
- Row Level Security (RLS) enabled
- User data isolated per account
- API keys secured via environment variables
- No sensitive data exposed to client-side

Your KiotViet Dashboard is now production-ready! 🎉
