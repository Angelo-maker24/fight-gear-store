
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  cedula TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Crear tabla de categorías
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  is_on_sale BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de métodos de pago
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bank_transfer', 'mobile_payment', 'zelle', 'binance'
  account_holder TEXT,
  account_number TEXT,
  bank_name TEXT,
  phone TEXT,
  email TEXT,
  additional_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_usd DECIMAL(10,2) NOT NULL,
  total_bs DECIMAL(15,2),
  exchange_rate DECIMAL(10,4),
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'
  payment_method_id UUID REFERENCES public.payment_methods(id),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de items del pedido
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de comprobantes de pago
CREATE TABLE public.payment_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  holder_name TEXT NOT NULL,
  holder_phone TEXT NOT NULL,
  holder_cedula TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  amount_paid DECIMAL(15,2) NOT NULL,
  receipt_image_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Crear tabla para configuración de tasa de cambio
CREATE TABLE public.exchange_rate_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_rate DECIMAL(10,4),
  last_bcv_rate DECIMAL(10,4),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  use_manual_rate BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rate_config ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para categorías (lectura pública)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Políticas para productos (lectura pública, escritura solo admins)
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (is_active = true);

-- Políticas para métodos de pago (lectura pública si están activos)
CREATE POLICY "Active payment methods are viewable by everyone" ON public.payment_methods
  FOR SELECT USING (is_active = true);

-- Políticas para pedidos (usuarios ven solo los suyos, admins ven todos)
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para items de pedido
CREATE POLICY "Users can view items of their own orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Políticas para comprobantes de pago
CREATE POLICY "Users can view their own payment receipts" ON public.payment_receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment receipts" ON public.payment_receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar categorías iniciales
INSERT INTO public.categories (name, description, icon) VALUES
  ('guantes', 'Guantes de boxeo y artes marciales', '🥊'),
  ('protection', 'Protecciones y equipos de seguridad', '🛡️'),
  ('clothing', 'Ropa deportiva y uniformes', '👕'),
  ('equipment', 'Equipos de entrenamiento', '🏋️'),
  ('accessories', 'Accesorios diversos', '⚡');

-- Insertar configuración inicial de tasa de cambio
INSERT INTO public.exchange_rate_config (manual_rate, use_manual_rate) VALUES (36.50, true);
