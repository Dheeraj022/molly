-- ============================================
-- ADD INVOICE DATE COLUMN TO QUOTATIONS
-- ============================================

-- 1. Add the column if it doesn't exist
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS invoice_date DATE;

-- 2. Backfill existing data
-- Try to get date from invoice_details JSON first, fallback to created_at
UPDATE quotations
SET invoice_date = COALESCE(
  (invoice_details->>'invoiceDate')::DATE, 
  created_at::DATE
)
WHERE invoice_date IS NULL;

-- 3. Make it NOT NULL for future integrity (optional, but good practice)
-- ALTER TABLE quotations ALTER COLUMN invoice_date SET NOT NULL;

-- 4. Create index for performance on sorting/filtering
CREATE INDEX IF NOT EXISTS idx_quotations_invoice_date ON quotations(invoice_date DESC);
