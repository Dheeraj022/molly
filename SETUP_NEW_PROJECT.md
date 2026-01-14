# 🚀 New Supabase Project Setup

Quick guide to set up your database schema in the new Supabase project.

## 📋 New Project Details

**Project URL**: `https://pwhzvssdrfdmzwxfvzwl.supabase.co`  
**Anon Key**: Already configured in `src/services/supabase.js` ✅

## ⚡ Setup Steps (3 Minutes)

### Step 1: Create Database Tables

1. Go to: https://pwhzvssdrfdmzwxfvzwl.supabase.co
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Run these scripts **in order**:

#### A. Main Tables (Required)
- Copy entire content from [CREATE_TABLES.sql](file:///d:/molly/CREATE_TABLES.sql)
- Paste and click **RUN**
- Creates: `companies`, `quotations` tables + RLS policies + indexes

#### B. Buyers Table (Required)
- Copy entire content from [CREATE_BUYERS_TABLE.sql](file:///d:/molly/CREATE_BUYERS_TABLE.sql)
- Paste and click **RUN**
- Creates: `buyers` table + RLS policies

#### C. Signature Support (Optional)
- Copy entire content from [ADD_SIGNATURE_COLUMN.sql](file:///d:/molly/ADD_SIGNATURE_COLUMN.sql)
- Paste and click **RUN**
- Adds: `signature_url` column to companies table

#### D. Storage Setup (Optional)
- Copy entire content from [SETUP_STORAGE.sql](file:///d:/molly/SETUP_STORAGE.sql)
- Paste and click **RUN**
- Creates: Storage buckets for logos and signatures

### Step 2: Verify Setup

Run this verification query in SQL Editor:

```sql
-- Check tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'buyers', 'quotations');

-- Check RLS policies (should show 12 policies)
SELECT tablename, policyname, cmd as operation
FROM pg_policies 
WHERE tablename IN ('companies', 'buyers', 'quotations')
ORDER BY tablename, policyname;
```

Expected output:
- ✅ 3 tables created
- ✅ 12 RLS policies active
- ✅ All tables empty (ready for new data)

### Step 3: Test Your Application

Your app is already configured with the new credentials!

```bash
npm run dev
```

Test these features:
- ✅ Create new company
- ✅ Create new buyer
- ✅ Create new quotation/invoice
- ✅ Generate PDF

## 📊 Database Schema

### Companies Table
Stores seller/company profiles:
- `id`, `company_name`, `address`, `phone`, `email`
- `gst_number`, `pan_number`, `tagline`, `logo_url`
- `signature_url` (if you ran ADD_SIGNATURE_COLUMN.sql)
- `created_at`, `updated_at`

### Buyers Table
Stores buyer/customer profiles:
- `id`, `buyer_name`, `address`
- `gst_number`, `phone`, `email`
- `created_at`, `updated_at`

### Quotations Table
Stores invoices and quotations:
- `id`, `quotation_no` (unique)
- `company_id` → companies, `buyer_id` → buyers
- `buyer_name`, `buyer_address`, `buyer_gst`
- `invoice_details` (JSONB), `items` (JSONB array)
- `gst_rate`, totals, `status` (quotation/invoice)
- `created_at`, `updated_at`

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Anonymous access allowed (for development)
- ⚠️ **Production**: Update RLS policies for authenticated users only

## 📁 SQL Files Reference

| File | Purpose | Required |
|------|---------|----------|
| `CREATE_TABLES.sql` | Companies & quotations tables | ✅ Yes |
| `CREATE_BUYERS_TABLE.sql` | Buyers table | ✅ Yes |
| `ADD_SIGNATURE_COLUMN.sql` | Signature support | Optional |
| `SETUP_STORAGE.sql` | File upload buckets | Optional |

## ✅ You're Done!

Your new Supabase project is ready with a fresh database schema. Start creating companies, buyers, and invoices!

---

**Project**: https://pwhzvssdrfdmzwxfvzwl.supabase.co  
**Status**: Fresh schema, no data ✨
