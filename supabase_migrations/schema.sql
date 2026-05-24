-- B.F.O Property Maintenance - Supabase Database Schema
-- Location: public.bfo_leads, public.bfo_invoices, public.bfo_audit_logs
-- Created: 2026-05-23

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS public.bfo_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service_raw VARCHAR(100),
    message TEXT,
    language VARCHAR(10) DEFAULT 'en', -- 'en' or 'pt'
    source VARCHAR(100) DEFAULT 'website', -- 'website', 'facebook', 'manual'
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'completed', 'lost'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS public.bfo_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.bfo_leads(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'overdue', 'cancelled'
    pdf_url TEXT, -- Link to Supabase Storage PDF
    issued_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.bfo_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- 'webhook_received', 'wa_sent', 'email_failed', 'pdf_created'
    payload JSONB, -- Full API response or error traceback
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.bfo_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bfo_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bfo_audit_logs ENABLE ROW LEVEL SECURITY;
