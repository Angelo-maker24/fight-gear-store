
-- Agregar columna estado_pedido a la tabla orders si no existe
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estado_pedido TEXT DEFAULT 'Pendiente de verificación';

-- Crear bucket para productos si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para el bucket de productos
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload products" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

CREATE POLICY IF NOT EXISTS "Allow public read access to products" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'products');

CREATE POLICY IF NOT EXISTS "Allow admin users to delete products" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'products' AND 
  auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
);

-- Actualizar las políticas de RLS para exchange_rate_config si no existen
CREATE POLICY IF NOT EXISTS "Allow select for everyone on exchange_rate_config"
ON public.exchange_rate_config
FOR SELECT
TO public
USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert for admin on exchange_rate_config"
ON public.exchange_rate_config
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE is_admin = true
    )
);

CREATE POLICY IF NOT EXISTS "Allow update for admin on exchange_rate_config"
ON public.exchange_rate_config
FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE is_admin = true
    )
);

-- Habilitar RLS en exchange_rate_config si no está habilitado
ALTER TABLE public.exchange_rate_config ENABLE ROW LEVEL SECURITY;

-- Agregar campos adicionales a payment_receipts para el comprobante de pago
ALTER TABLE public.payment_receipts 
ADD COLUMN IF NOT EXISTS bank_used TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_orders_estado_pedido ON public.orders(estado_pedido);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_order_id ON public.payment_receipts(order_id);
