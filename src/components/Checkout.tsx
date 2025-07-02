
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard, MapPin, FileText } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Checkout = ({ isOpen, onClose }: CheckoutProps) => {
  // Hooks para obtener datos del carrito, métodos de pago, tasa de cambio y usuario
  const { cart, getTotalPrice, clearCart } = useCart();
  const { paymentMethods } = usePaymentMethods();
  const { exchangeRate, rateInBs } = useExchangeRate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estados del formulario de checkout
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Función para validar y limpiar datos numéricos antes de enviar a Supabase
  const validateNumericField = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return 0;
    }
    return Number(value);
  };

  // Función para limpiar strings y evitar valores nulos problemáticos
  const cleanStringField = (value: string | null | undefined): string | null => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  };

  // Calcular totales usando la tasa de cambio actual
  const totalUSD = getTotalPrice();
  const totalBS = totalUSD * rateInBs;

  // Función principal para procesar el checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas antes de procesar
    if (!user) {
      toast.error('Debes iniciar sesión para realizar una compra');
      return;
    }

    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Selecciona un método de pago');
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando proceso de checkout...');
      console.log('Usuario:', user.id);
      console.log('Carrito:', cart);
      console.log('Total USD:', totalUSD);
      console.log('Total BS:', totalBS);
      console.log('Tasa de cambio:', rateInBs);

      // Preparar datos de la orden con validación numérica
      const orderData = {
        user_id: user.id,
        total_usd: validateNumericField(totalUSD),
        total_bs: validateNumericField(totalBS),
        exchange_rate: validateNumericField(rateInBs),
        payment_method_id: selectedPaymentMethod,
        shipping_address: {
          firstName: cleanStringField(shippingData.firstName),
          lastName: cleanStringField(shippingData.lastName),
          phone: cleanStringField(shippingData.phone),
          address: cleanStringField(shippingData.address),
          city: cleanStringField(shippingData.city),
          state: cleanStringField(shippingData.state),
          zipCode: cleanStringField(shippingData.zipCode)
        },
        notes: cleanStringField(orderNotes),
        status: 'pending'
      };

      console.log('Datos de la orden a insertar:', orderData);

      // Crear la orden en Supabase
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('Error al crear orden:', orderError);
        throw orderError;
      }

      console.log('Orden creada exitosamente:', orderResult);

      // Preparar items de la orden con validación numérica
      const orderItems = cart.map(item => ({
        order_id: orderResult.id,
        product_id: item.id,
        quantity: validateNumericField(item.quantity),
        unit_price: validateNumericField(item.price),
        total_price: validateNumericField(item.price * item.quantity)
      }));

      console.log('Items de la orden a insertar:', orderItems);

      // Insertar items de la orden
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error al crear items de orden:', itemsError);
        throw itemsError;
      }

      console.log('Items de orden creados exitosamente');

      // Limpiar carrito y cerrar checkout si todo fue exitoso
      clearCart();
      toast.success('¡Orden creada exitosamente! Te contactaremos pronto para confirmar el pago.');
      onClose();

    } catch (error: any) {
      console.error('Error completo en checkout:', error);
      toast.error('Error al procesar la orden: ' + (error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Si el carrito está vacío, mostrar mensaje apropiado
  if (cart.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent aria-describedby="empty-cart-description">
          <DialogHeader>
            <DialogTitle>Carrito Vacío</DialogTitle>
            <p id="empty-cart-description" className="text-sm text-gray-600">
              No tienes productos en tu carrito de compras
            </p>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Tu carrito está vacío</p>
            <Button onClick={onClose} className="mt-4">
              Continuar Comprando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="checkout-description">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <p id="checkout-description" className="text-sm text-gray-600">
            Completa los datos para procesar tu pedido
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda: Información de envío */}
            <div className="space-y-6">
              {/* Resumen del pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Resumen del Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total USD:</span>
                      <span>${totalUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Total BS (aprox.):</span>
                      <span>Bs. {totalBS.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tasa: {rateInBs.toFixed(2)} Bs/$
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Información de envío con validación */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Información de Envío</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={shippingData.firstName}
                        onChange={(e) => setShippingData({...shippingData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={shippingData.lastName}
                        onChange={(e) => setShippingData({...shippingData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                      placeholder="04XX-XXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        value={shippingData.state}
                        onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData({...shippingData, zipCode: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha: Método de pago y notas */}
            <div className="space-y-6">
              {/* Método de pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Método de Pago</span>
                  </CardTitle>
                  <CardDescription>
                    Selecciona cómo deseas pagar tu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{method.name}</span>
                            <span className="text-sm text-gray-600">
                              {method.account_holder && `${method.account_holder} - `}
                              {method.bank_name}
                              {method.phone && ` - ${method.phone}`}
                              {method.additional_data?.cedula && ` - CI: ${method.additional_data.cedula}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Notas adicionales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Notas Adicionales</span>
                  </CardTitle>
                  <CardDescription>
                    Información adicional sobre tu pedido (opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Instrucciones especiales, comentarios, etc."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
