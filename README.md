# KiotViet Dashboard 🏪

A comprehensive business analytics dashboard for KiotViet stores, built with Next.js, Supabase, and shadcn/ui. This dashboard provides real-time insights, customer analytics, and business intelligence for Vietnamese businesses using KiotViet POS system.

## ✨ Features

- 🔐 **Secure Authentication** - Supabase Auth with email/password login
- 🌙 **Dark/Light Mode** - Full theme customization with system preference detection
- 🌍 **Multi-language** - Support for Vietnamese and English with country flags
- 📊 **Real-time Analytics** - Live data from KiotViet API
- 📈 **Interactive Charts** - Beautiful visualizations using Recharts
- 🎛️ **Advanced Filtering** - Filter by data type and time periods
- 🤖 **AI Panel** - AI assistant interface (UI ready for future integration)
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast Performance** - Optimized with Next.js 14 and modern technologies

## 🛠️ Tech Stack

- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Charts:** Recharts
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **Deployment:** Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (free tier available)
- KiotViet API credentials

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd kietviet-dashboard
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# KiotViet API Credentials (optional - users can add via UI)
KIOTVIET_CLIENT_ID=your-client-id-here
KIOTVIET_SECRET_KEY=your-secret-key-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set up Supabase database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-schema.sql`

This will create all necessary tables and security policies.

### 5. Start the development server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see your dashboard!

## 📋 Usage Guide

### First Time Setup

1. **Sign up** for a new account or **sign in** if you already have one
2. You'll see demo data initially to explore the dashboard
3. Go to **Settings** to add your KiotViet API credentials
4. Once credentials are added, the dashboard will display live data from your store

### Features Overview

#### 🏠 Dashboard Home

- Key business metrics (revenue, orders, customers, products)
- Interactive charts showing trends and insights
- Filter data by time periods (week, month, year, all time)
- Switch between different data views (sales, products, customers, orders)

#### ⚙️ Settings

- Add/update KiotViet API credentials
- Toggle dark/light mode
- Switch between English and Vietnamese
- View connection status

#### 🤖 AI Assistant

- Interactive AI panel (UI ready - integration coming soon)
- Will provide business insights and answer questions about your data

### API Integration

The dashboard integrates with these KiotViet API endpoints:

- **Products** - Inventory management and product analytics
- **Customers** - Customer demographics and behavior analysis
- **Orders** - Sales performance and order tracking
- **Invoices** - Financial analytics and revenue tracking
- **Categories** - Product categorization insights
- **Branches** - Multi-location business analytics

## 🔧 Configuration

### Customizing the Dashboard

You can customize various aspects of the dashboard:

1. **Theme Colors** - Edit `tailwind.config.ts` for custom color schemes
2. **Languages** - Add more languages in `components/providers/language-provider.tsx`
3. **Charts** - Customize chart types and styling in `components/dashboard/charts.tsx`
4. **API Endpoints** - Modify API integration in `lib/kiotviet-api.ts`

### Adding New Features

The codebase is well-structured for adding new features:

- **New Pages** - Add to `app/dashboard/` directory
- **New Components** - Add to `components/` directory
- **New API Methods** - Extend `lib/kiotviet-api.ts`
- **New Translations** - Update the translations object in the language provider

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Issues**

   - Ensure Supabase URL and keys are correct
   - Check if email confirmation is enabled in Supabase Auth settings

2. **API Connection Issues**

   - Verify KiotViet credentials are correct
   - Check if your KiotViet account has API access enabled
   - Ensure your shop name matches exactly

3. **Build Issues**
   - Clear `.next` folder and `node_modules`
   - Run `npm install` again
   - Check for TypeScript errors

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase database schema is properly set up
4. Check KiotViet API documentation for any changes

## 📈 Performance

The dashboard is optimized for performance:

- **SSR/SSG** - Server-side rendering with Next.js
- **Code Splitting** - Automatic code splitting for faster loading
- **Image Optimization** - Next.js image optimization
- **Caching** - API response caching for better performance
- **Lazy Loading** - Components load only when needed

## 🔒 Security

Security features included:

- **Row Level Security** - Database-level security with Supabase RLS
- **Authentication** - Secure user authentication with Supabase Auth
- **API Key Protection** - Secure storage of API credentials
- **HTTPS Only** - All communications encrypted
- **XSS Protection** - Built-in Next.js security features

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **KiotViet** for providing the POS system and API
- **Supabase** for the amazing backend platform
- **Vercel** for the deployment platform
- **shadcn/ui** for the beautiful UI components

---

Built with ❤️ for Vietnamese businesses using KiotViet POS system.
