
-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true);

-- Create policy to allow authenticated users to upload receipts
CREATE POLICY "Allow authenticated users to upload receipts" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'receipts');

-- Create policy to allow public read access to receipts
CREATE POLICY "Allow public read access to receipts" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'receipts');
