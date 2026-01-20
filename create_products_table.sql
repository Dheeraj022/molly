-- Create products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  hsn_code TEXT,
  price NUMERIC DEFAULT 0,
  gst_rate NUMERIC DEFAULT 18,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own products" 
ON products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own products" 
ON products FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON products FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON products FOR DELETE 
USING (auth.uid() = user_id);
