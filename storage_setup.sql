-- Create Storage Bucket for Payment Proofs
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Storage Policies

-- 1. Allow Public Access to View Proofs
create policy "Public Access to Payment Proofs"
on storage.objects for select
using ( bucket_id = 'payment-proofs' );

-- 2. Allow Authenticated Users to Upload Proofs
create policy "Authenticated Users can Upload Payment Proofs"
on storage.objects for insert
with check ( bucket_id = 'payment-proofs' and auth.role() = 'authenticated' );

-- 3. Allow Users to Delete their own Proofs
create policy "Users can delete their own payment proofs"
on storage.objects for delete
using ( bucket_id = 'payment-proofs' and auth.uid() = owner );
