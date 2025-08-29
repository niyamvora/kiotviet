# 🚀 KiotViet Dashboard Setup Instructions

## Step-by-Step Setup Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Copy and run the entire contents of `supabase-schema.sql`**

This creates:

- User credentials table
- User preferences table
- API cache table
- Activity logs table
- All necessary security policies

### 3. Configure Environment Variables

Your `.env.local` should look like this:

```env
# KiotViet API Credentials (these are already set from your .env)
KIOTVIET_CLIENT_ID=761c0672-a038-4c85-9c2e-11890aacc5d2
KIOTVIET_SECRET_KEY=59D98EA30A4F6B4B80EAA2F099904A8AB3906C23

# Supabase Configuration (these are already set from your .env)
NEXT_PUBLIC_SUPABASE_URL=https://tfwerkakfgqmkskojgcj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmd2Vya2FrZmdxbWtza29qZ2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzA4MDUsImV4cCI6MjA3MjA0NjgwNX0.8-4E4xBaaebL5fZXWN5w_KzqzdUF8qOOhtl9UB7cSzg
```

### 4. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 What You'll See

### 1. **Landing Page**

- Redirects to login if not authenticated
- Redirects to dashboard if authenticated

### 2. **Authentication**

- Beautiful login/signup pages
- Theme toggle (dark/light mode)
- Language toggle (English/Vietnamese) with flags
- Supabase authentication integration

### 3. **Dashboard**

- **Sidebar Navigation**: Dashboard, Sales, Products, Customers, Orders, Analytics, Settings
- **Header**: User menu, AI panel toggle, theme toggle, language toggle
- **Main Content**:
  - Key metrics cards (revenue, orders, customers, products)
  - Filter tabs (overview, sales, products, customers, orders)
  - Timeline filter (week, month, year, all time)
  - Interactive charts using Recharts
- **AI Panel**: Right-side drawer with chat interface (UI only for now)

### 4. **Settings Page**

- KiotViet API credentials management
- Theme preferences (dark/light mode toggle)
- Language preferences (English/Vietnamese toggle)
- Connection status indicator

## 🔧 Key Features Implemented

### ✅ **Authentication System**

- Supabase Auth with email/password
- User registration and login
- Protected routes
- Session management

### ✅ **Dashboard Layout**

- Responsive sidebar navigation
- Header with user menu
- AI panel drawer
- Modern, professional design

### ✅ **Multi-language Support**

- English and Vietnamese translations
- Country flag indicators
- Persistent language preferences

### ✅ **Dark Mode Support**

- System theme detection
- Toggle between light/dark modes
- Persistent theme preferences

### ✅ **Data Visualization**

- Revenue trend charts
- Category distribution pie chart
- Top products bar chart
- Customer growth area chart
- All using Recharts library

### ✅ **Filtering System**

- Filter by data type (sales, products, customers, etc.)
- Timeline filtering (week, month, year, all time)
- Dynamic data updates

### ✅ **KiotViet Integration**

- Complete API service integration
- Credentials management
- Real-time data fetching
- Error handling and authentication

### ✅ **AI Panel (UI)**

- Slide-out drawer design
- Chat interface mockup
- Ready for AI integration

## 📊 Demo Data vs Live Data

### **New Users (No Credentials)**

- See demo/dummy data
- Can explore all dashboard features
- Professional-looking sample charts and metrics

### **Users with KiotViet Credentials**

- Go to Settings → Add your Client ID, Secret Key, and Shop Name
- Dashboard switches to live data from your KiotViet store
- Real analytics and insights from your business

## 🎨 Design Highlights

### **Modern UI**

- Clean, professional design
- shadcn/ui components
- Consistent color scheme
- Responsive layouts

### **Interactive Charts**

- Line charts for trends
- Pie charts for distributions
- Bar charts for comparisons
- Area charts for growth metrics

### **User Experience**

- Smooth transitions and animations
- Loading states with skeletons
- Toast notifications for actions
- Intuitive navigation

## 🔒 Security Features

### **Database Security**

- Row Level Security (RLS) policies
- User isolation
- Secure credential storage

### **Authentication**

- Supabase Auth integration
- Protected routes
- Session management

## 📱 Responsive Design

- **Desktop**: Full sidebar, multi-column layout
- **Tablet**: Collapsible sidebar, responsive grids
- **Mobile**: Hidden sidebar with toggle, stacked layouts

## 🚀 Ready for Production

The dashboard is production-ready with:

- Optimized performance
- Security best practices
- Error handling
- Loading states
- User feedback systems

## 🎯 Next Steps (Optional)

1. **Deploy to Vercel**: Connect your GitHub repo to Vercel
2. **Add Real AI**: Integrate with OpenAI or other AI services
3. **Add More Charts**: Extend with additional analytics
4. **Custom Branding**: Add your logo and brand colors
5. **Advanced Features**: Add export functionality, advanced filtering, etc.

---

Your KiotViet Dashboard is now ready to use! 🎉
