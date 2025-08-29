/**
 * Simple Supabase client configuration
 * Clean and straightforward setup that just works
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserCredentials {
  id: string;
  user_id: string;
  client_id: string;
  secret_key: string;
  shop_name: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: "light" | "dark";
  language: "en" | "vi";
  created_at: string;
  updated_at: string;
}
