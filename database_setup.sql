-- SUPABASE DATABASE SETUP FOR KIOTVIET DATA SYNCHRONIZATION
-- Copy and paste this entire SQL into your Supabase SQL Editor and run it

-- Step 1: Create tables for KiotViet data caching and sync management
-- This enables incremental data synchronization instead of full refresh

-- Table to track sync status for each data type per user
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('products', 'customers', 'orders', 'invoices')),
  last_sync_date TIMESTAMPTZ DEFAULT NOW(),
  last_successful_sync TIMESTAMPTZ DEFAULT NOW(),
  total_items_synced INTEGER DEFAULT 0,
  sync_in_progress BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data_type)
);

-- Cached KiotViet Products
CREATE TABLE IF NOT EXISTS kiotviet_products (
  id INTEGER PRIMARY KEY, -- KiotViet product ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core product data from KiotViet API
  name TEXT,
  full_name TEXT,
  code TEXT,
  barcode TEXT,
  category_id INTEGER,
  category_name TEXT,
  base_price DECIMAL(15,2),
  
  -- Inventory data
  on_hand INTEGER DEFAULT 0,
  committed INTEGER DEFAULT 0,
  available INTEGER DEFAULT 0,
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Sync tracking
  kiotviet_created_date TIMESTAMPTZ,
  kiotviet_modified_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached KiotViet Customers  
CREATE TABLE IF NOT EXISTS kiotviet_customers (
  id INTEGER PRIMARY KEY, -- KiotViet customer ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Customer data from KiotViet API
  name TEXT,
  code TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  location_name TEXT,
  
  -- Customer stats
  total_invoice DECIMAL(15,2) DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Sync tracking
  kiotviet_created_date TIMESTAMPTZ,
  kiotviet_modified_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached KiotViet Orders
CREATE TABLE IF NOT EXISTS kiotviet_orders (
  id INTEGER PRIMARY KEY, -- KiotViet order ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order data from KiotViet API
  code TEXT,
  customer_id INTEGER,
  customer_name TEXT,
  branch_id INTEGER,
  branch_name TEXT,
  
  -- Order details
  total DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  status TEXT,
  order_date TIMESTAMPTZ,
  
  -- Items count
  total_items INTEGER DEFAULT 0,
  
  -- Sync tracking
  kiotviet_created_date TIMESTAMPTZ,
  kiotviet_modified_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached KiotViet Invoices (Revenue tracking)
CREATE TABLE IF NOT EXISTS kiotviet_invoices (
  id INTEGER PRIMARY KEY, -- KiotViet invoice ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Invoice data from KiotViet API
  code TEXT,
  customer_id INTEGER,
  customer_name TEXT,
  branch_id INTEGER,
  branch_name TEXT,
  
  -- Financial data
  total DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Status and dates
  status TEXT,
  invoice_date TIMESTAMPTZ,
  payment_status TEXT,
  
  -- Sync tracking
  kiotviet_created_date TIMESTAMPTZ,
  kiotviet_modified_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync operation logs for debugging and monitoring
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('full_sync', 'incremental_sync', 'error')),
  
  -- Sync results
  items_processed INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_deleted INTEGER DEFAULT 0,
  
  -- Timing
  duration_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Error handling
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  error_details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sync_status_user_type ON sync_status(user_id, data_type);
CREATE INDEX IF NOT EXISTS idx_products_user ON kiotviet_products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_modified ON kiotviet_products(kiotviet_modified_date);
CREATE INDEX IF NOT EXISTS idx_customers_user ON kiotviet_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_modified ON kiotviet_customers(kiotviet_modified_date);
CREATE INDEX IF NOT EXISTS idx_orders_user ON kiotviet_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON kiotviet_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_modified ON kiotviet_orders(kiotviet_modified_date);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON kiotviet_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON kiotviet_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_modified ON kiotviet_invoices(kiotviet_modified_date);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON sync_logs(user_id, created_at);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiotviet_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiotviet_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiotviet_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiotviet_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies (users can only access their own data)
CREATE POLICY "Users can manage their sync status" ON sync_status
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their products" ON kiotviet_products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their customers" ON kiotviet_customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their orders" ON kiotviet_orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their invoices" ON kiotviet_invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their sync logs" ON sync_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Step 5: Create helper function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create triggers to auto-update timestamps
CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'KiotViet Data Sync Tables Created Successfully! 🎉' as message;
