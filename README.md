# ⚙️ BFO Automations & Operations Hub

This directory contains the backend triggers, database schemas, n8n webhook workflows, and integration scripts for **B.F.O Property Maintenance**.

---

## 📂 Folder Structure

*   📁 `n8n_workflows/` - JSON backup files of active n8n webhook routing flows.
*   📁 `supabase_migrations/` - SQL migration scripts and database schemas for leads/audit tables.
*   📁 `whatsapp_triggers/` - WhatsApp API payload scripts (e.g. Z-API notifications).
*   📁 `credentials/` - Git-ignored environment configs and private backend tokens.

---

## ⚡ Initial Setup Guide

1.  **Initialize Git**:
    ```bash
    git init
    git remote add origin https://github.com/frsbrasil/BFO_Automations.git
    ```
2.  **Backup Active Workflows**:
    Export active flows from n8n as JSON and save them under `n8n_workflows/`.
3.  **Backup Database Schemas**:
    Dump active table structures from your Supabase instance into `supabase_migrations/schema.sql`.
