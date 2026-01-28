-- Create Sales Table
create table if not exists sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  invoice_id uuid references quotations(id) not null,
  invoice_number text not null,
  buyer_name text not null,
  total_amount numeric not null default 0,
  received_amount numeric not null default 0,
  pending_amount numeric generated always as (total_amount - received_amount) stored,
  status text not null default 'pending', -- 'pending', 'partially_paid', 'paid'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Payments Table
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  amount numeric not null,
  payment_date date not null default current_date,
  payment_mode text not null, -- 'Cash', 'UPI', 'Bank', 'Cheque'
  reference_id text,
  proof_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table sales enable row level security;
alter table payments enable row level security;

-- RLS Policies for Sales
create policy "Users can view their own sales"
  on sales for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sales"
  on sales for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own sales"
  on sales for update
  using (auth.uid() = user_id);

create policy "Users can delete their own sales"
  on sales for delete
  using (auth.uid() = user_id);

-- RLS Policies for Payments
create policy "Users can view their own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own payments"
  on payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own payments"
  on payments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own payments"
  on payments for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists sales_user_id_idx on sales(user_id);
create index if not exists sales_invoice_id_idx on sales(invoice_id);
create index if not exists payments_sale_id_idx on payments(sale_id);
create index if not exists payments_user_id_idx on payments(user_id);
