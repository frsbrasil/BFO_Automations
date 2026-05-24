import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czuioghdmovaafzycjjy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Lead {
  id: string;
  created_at: string;
  source: string;
  channel_ref?: string;
  customer_id?: string;
  name: string;
  phone?: string;
  email?: string;
  postcode?: string;
  town?: string;
  language?: string;
  service_id?: string;
  service_raw?: string;
  message?: string;
  property_type?: string;
  urgency?: string;
  status: string;
  ai_handled: boolean;
  ai_quote_sent: boolean;
  ai_quote_range?: string;
  handoff_at?: string;
  beto_notified: boolean;
  beto_response_at?: string;
  notes?: string;
  lost_reason?: string;
}

export interface Service {
  id: string;
  slug: string;
  category: string;
  name_en: string;
  name_pt: string;
  desc_en?: string;
  desc_pt?: string;
  min_price?: number;
  typical_price?: number;
  max_price?: number;
  min_hours?: number;
  max_hours?: number;
  active: boolean;
  sort_order: number;
}
