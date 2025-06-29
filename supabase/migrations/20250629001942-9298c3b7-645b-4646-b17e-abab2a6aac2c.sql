
-- Crear usuario administrador con email específico
-- Nota: Este usuario se debe crear manualmente en Supabase Auth UI o usar la función de signup
-- Aquí crearemos el perfil admin que se activará cuando el usuario se registre

-- Insertar perfil de administrador (se activará cuando se registre el usuario)
-- Email: admin@boxeomax.com
-- Password: BoxeoMax2024!

-- Primero, insertamos algunos métodos de pago iniciales
INSERT INTO public.payment_methods (name, type, account_holder, account_number, bank_name, phone, email, is_active) VALUES
  ('Pago Móvil Banesco', 'mobile_payment', 'BoxeoMax C.A.', '04121234567', 'Banesco', '04121234567', 'pagos@boxeomax.com', true),
  ('Transferencia Mercantil', 'bank_transfer', 'BoxeoMax C.A.', '0105-1234-56-1234567890', 'Banco Mercantil', NULL, 'pagos@boxeomax.com', true),
  ('Zelle', 'zelle', 'BoxeoMax Store', NULL, NULL, NULL, 'payments@boxeomax.com', true),
  ('Binance Pay', 'binance', 'BoxeoMax', 'boxeomax_binance', NULL, NULL, 'crypto@boxeomax.com', true);

-- Insertar algunos productos de ejemplo
INSERT INTO public.products (name, description, price, original_price, category_id, is_on_sale, stock, is_active) VALUES
  (
    'Guantes Everlast Pro Style Elite',
    'Guantes de boxeo profesionales de cuero sintético con tecnología de absorción de impacto. Ideales para entrenamiento y competición.',
    45.00,
    NULL,
    (SELECT id FROM public.categories WHERE name = 'guantes' LIMIT 1),
    false,
    25,
    true
  ),
  (
    'Protector Bucal Venum Challenger',
    'Protector bucal de gel termoplástico con diseño anatómico. Máxima protección y comodidad durante el combate.',
    15.00,
    20.00,
    (SELECT id FROM public.categories WHERE name = 'protection' LIMIT 1),
    true,
    50,
    true
  ),
  (
    'Short de Boxeo Cleto Reyes',
    'Short profesional de boxeo en satín con cordón elástico. Diseño clásico y cómodo para entrenamientos intensos.',
    35.00,
    NULL,
    (SELECT id FROM public.categories WHERE name = 'clothing' LIMIT 1),
    false,
    30,
    true
  ),
  (
    'Saco de Boxeo Heavy Bag 100lbs',
    'Saco de boxeo pesado de cuero sintético relleno de arena y trapos. Incluye cadena de suspensión reforzada.',
    120.00,
    150.00,
    (SELECT id FROM public.categories WHERE name = 'equipment' LIMIT 1),
    true,
    10,
    true
  ),
  (
    'Vendas de Boxeo Elasticas 4.5m',
    'Vendas elásticas profesionales de 4.5 metros con velcro. Protección completa para muñecas y nudillos.',
    8.00,
    NULL,
    (SELECT id FROM public.categories WHERE name = 'accessories' LIMIT 1),
    false,
    100,
    true
  );
