import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, MapPin, Package, FileText, Upload, CheckCircle } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  phone: string;
  cedula: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
}

interface PaymentInfo {
  methodId: string;
  holderName: string;
  holderPhone: string;
  holderCedula: string;
  referenceNumber: string;
  amountPaid: number;
  receiptFile: File | null;
}

export const Checkout = ({ isOpen, onClose }: CheckoutProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const { paymentMethods } = usePaymentMethods();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    cedula: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: ''
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    methodId: '',
    holderName: '',
    holderPhone: '',
    holderCedula: '',
    referenceNumber: '',
    amountPaid: totalPrice,
    receiptFile: null
  });

  const exchangeRate = 50;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 5MB');
        return;
      }
      setPaymentInfo({ ...paymentInfo, receiptFile: file });
      toast.success('Comprobante cargado correctamente');
    }
  };

  const uploadReceipt = async (file: File, orderId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Error al subir el comprobante');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadReceipt:', error);
      toast.error('Error al procesar el comprobante');
      return null;
    }
  };

  const createOrder = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar una compra');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating order with user:', user.id);
      console.log('Payment method:', paymentInfo.methodId);
      console.log('Total items:', items.length);

      // Crear la orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_usd: totalPrice,
            total_bs: totalPrice * exchangeRate,
            exchange_rate: exchangeRate,
            payment_method_id: paymentInfo.methodId,
            shipping_address: {
              firstName: shippingInfo.firstName,
              lastName: shippingInfo.lastName,
              phone: shippingInfo.phone,
              cedula: shippingInfo.cedula,
              address: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postalCode: shippingInfo.postalCode
            },
            notes: shippingInfo.notes,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Error al crear orden: ${orderError.message}`);
      }

      console.log('Order created:', order);

      // Crear los items de la orden
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error(`Error al crear items: ${itemsError.message}`);
      }

      console.log('Order items created');

      // Subir comprobante si existe
      let receiptUrl = null;
      if (paymentInfo.receiptFile) {
        console.log('Uploading receipt...');
        receiptUrl = await uploadReceipt(paymentInfo.receiptFile, order.id);
        if (!receiptUrl) {
          throw new Error('Error al subir el comprobante');
        }
      }

      // Crear el recibo de pago
      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .insert([
          {
            order_id: order.id,
            user_id: user.id,
            amount_paid: paymentInfo.amountPaid,
            holder_name: paymentInfo.holderName,
            holder_phone: paymentInfo.holderPhone,
            holder_cedula: paymentInfo.holderCedula,
            reference_number: paymentInfo.referenceNumber,
            receipt_image_url: receiptUrl,
            status: 'pending'
          }
        ]);

      if (receiptError) {
        console.error('Receipt error:', receiptError);
        throw new Error(`Error al crear recibo: ${receiptError.message}`);
      }

      console.log('Payment receipt created');

      // Limpiar carrito y cerrar checkout
      clearCart();
      toast.success('¡Pedido creado exitosamente! Te contactaremos pronto.');
      onClose();
      setCurrentStep(1);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentInfo.methodId);

  const renderPaymentMethodInfo = () => {
    if (!selectedPaymentMethod) return null;

    return (
      <Card className="mt-4 bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Información de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Método:</strong> {selectedPaymentMethod.name}</div>
          {selectedPaymentMethod.account_holder && (
            <div><strong>Titular:</strong> {selectedPaymentMethod.account_holder}</div>
          )}
          {selectedPaymentMethod.account_number && (
            <div><strong>Cuenta:</strong> {selectedPaymentMethod.account_number}</div>
          )}
          {selectedPaymentMethod.bank_name && (
            <div><strong>Banco:</strong> {selectedPaymentMethod.bank_name}</div>
          )}
          {selectedPaymentMethod.phone && (
            <div><strong>Teléfono:</strong> {selectedPaymentMethod.phone}</div>
          )}
          {selectedPaymentMethod.email && (
            <div><strong>Email:</strong> {selectedPaymentMethod.email}</div>
          )}
          <div className="mt-3 p-2 bg-blue-100 rounded">
            <strong>Total a pagar:</strong> ${totalPrice.toFixed(2)} USD 
            <span className="text-sm text-gray-600"> (~{(totalPrice * exchangeRate).toFixed(2)} Bs)</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Carrito vacío</h3>
              <p className="text-gray-600 mb-4">Agrega productos antes de proceder al checkout</p>
              <Button onClick={onClose}>Volver a comprar</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center text-2xl">
            <Package className="w-6 h-6 mr-2" />
            Checkout - Paso {currentStep} de 3
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Order Summary */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <img 
                          src={item.image_url || '/placeholder.svg'} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                          <p className="font-bold text-green-600">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <div className="text-right">
                          <div>${totalPrice.toFixed(2)} USD</div>
                          <div className="text-sm text-gray-600">~{(totalPrice * exchangeRate).toFixed(2)} Bs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={onClose}>
                  Volver al Carrito
                </Button>
                <Button onClick={() => setCurrentStep(2)}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Información de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cedula">Cédula</Label>
                      <Input
                        id="cedula"
                        value={shippingInfo.cedula}
                        onChange={(e) => setShippingInfo({...shippingInfo, cedula: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({...shippingInfo, notes: e.target.value})}
                      placeholder="Instrucciones especiales de entrega..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Atrás
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.phone || !shippingInfo.address}
                >
                  Continuar al Pago
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="paymentMethod">Método de Pago</Label>
                    <Select value={paymentInfo.methodId} onValueChange={(value) => setPaymentInfo({...paymentInfo, methodId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.filter(pm => pm.is_active).map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center space-x-2">
                              <span>
                                {method.type === 'mobile_payment' && '📱'}
                                {method.type === 'bank_transfer' && '🏦'}
                                {method.type === 'zelle' && '💳'}
                                {method.type === 'binance' && '₿'}
                              </span>
                              <span>{method.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {renderPaymentMethodInfo()}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="holderName">Nombre del Titular</Label>
                      <Input
                        id="holderName"
                        value={paymentInfo.holderName}
                        onChange={(e) => setPaymentInfo({...paymentInfo, holderName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="holderCedula">Cédula del Titular</Label>
                      <Input
                        id="holderCedula"
                        value={paymentInfo.holderCedula}
                        onChange={(e) => setPaymentInfo({...paymentInfo, holderCedula: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="holderPhone">Teléfono del Titular</Label>
                      <Input
                        id="holderPhone"
                        value={paymentInfo.holderPhone}
                        onChange={(e) => setPaymentInfo({...paymentInfo, holderPhone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="referenceNumber">Número de Referencia</Label>
                      <Input
                        id="referenceNumber"
                        value={paymentInfo.referenceNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, referenceNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amountPaid">Monto Pagado (USD)</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      step="0.01"
                      value={paymentInfo.amountPaid}
                      onChange={(e) => setPaymentInfo({...paymentInfo, amountPaid: parseFloat(e.target.value)})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="receipt">Comprobante de Pago</Label>
                    <div className="mt-1">
                      <input
                        type="file"
                        id="receipt"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('receipt')?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {paymentInfo.receiptFile ? paymentInfo.receiptFile.name : 'Subir Comprobante'}
                      </Button>
                      {paymentInfo.receiptFile && (
                        <Badge variant="secondary" className="mt-2">
                          ✓ Archivo cargado
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Atrás
                </Button>
                <Button 
                  onClick={createOrder}
                  disabled={loading || !paymentInfo.methodId || !paymentInfo.holderName || !paymentInfo.referenceNumber}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
