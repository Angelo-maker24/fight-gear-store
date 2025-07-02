
-- Crear políticas RLS adicionales para completar el sistema

-- Políticas para payment_methods (permitir administradores crear/editar)
CREATE POLICY "Allow insert for authenticated users" 
ON public.payment_methods 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow update for authenticated users" 
ON public.payment_methods 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow delete for admin users" 
ON public.payment_methods 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para products (permitir administradores crear/editar)
CREATE POLICY "Allow insert for authenticated users" 
ON public.products 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow update for authenticated users" 
ON public.products 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow delete for admin users" 
ON public.products 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Política adicional para order_items (permitir inserción en batch)
CREATE POLICY "Allow insert for authenticated users" 
ON public.order_items 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas adicionales para orders (permitir admin ver todos)
CREATE POLICY "Allow update for admin users" 
ON public.orders 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para payment_receipts (permitir admin ver/editar todos)
CREATE POLICY "Allow admin to view all receipts" 
ON public.payment_receipts 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow admin to update receipts" 
ON public.payment_receipts 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
