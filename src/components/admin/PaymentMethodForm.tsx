
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/hooks/usePaymentMethods';

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod?: PaymentMethod | null;
  onSuccess: () => void;
}

// Tipos de pago disponibles con configuraciones específicas
const paymentTypes = [
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'mobile_payment', label: 'Pago Móvil' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'binance', label: 'Binance Pay' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Criptomonedas' }
];

export const PaymentMethodForm = ({ isOpen, onClose, paymentMethod, onSuccess }: PaymentMethodFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    account_holder: '',
    account_number: '',
    bank_name: '',
    phone: '',
    email: '',
    cedula: '', // Nuevo campo para cédula
    is_active: true
  });

  // Función para validar y limpiar datos numéricos antes de enviar a Supabase
  const validateNumericField = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return 0;
    }
    return Number(value);
  };

  // Función para limpiar strings y evitar valores null/undefined
  const cleanStringField = (value: string | null | undefined): string | null => {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  };

  useEffect(() => {
    if (paymentMethod) {
      // Cargar datos del método de pago existente
      setFormData({
        name: paymentMethod.name || '',
        type: paymentMethod.type || '',
        account_holder: paymentMethod.account_holder || '',
        account_number: paymentMethod.account_number || '',
        bank_name: paymentMethod.bank_name || '',
        phone: paymentMethod.phone || '',
        email: paymentMethod.email || '',
        cedula: paymentMethod.additional_data?.cedula || '',
        is_active: paymentMethod.is_active ?? true
      });
    } else {
      // Resetear formulario para nuevo método de pago
      setFormData({
        name: '',
        type: '',
        account_holder: '',
        account_number: '',
        bank_name: '',
        phone: '',
        email: '',
        cedula: '',
        is_active: true
      });
    }
  }, [paymentMethod, isOpen]);

  // Función para determinar qué campos mostrar según el tipo de pago
  const shouldShowField = (fieldName: string): boolean => {
    if (formData.type === 'mobile_payment') {
      // Para Pago Móvil solo mostrar: titular, banco, cédula, teléfono
      return ['account_holder', 'bank_name', 'cedula', 'phone'].includes(fieldName);
    }
    
    // Para otros tipos de pago, mostrar campos tradicionales
    switch (fieldName) {
      case 'account_number':
        return !['mobile_payment'].includes(formData.type);
      case 'bank_name':
        return ['bank_transfer', 'mobile_payment'].includes(formData.type);
      case 'phone':
        return ['mobile_payment', 'binance'].includes(formData.type);
      case 'email':
        return ['zelle', 'paypal', 'crypto'].includes(formData.type);
      case 'cedula':
        return formData.type === 'mobile_payment';
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos con validación numérica y limpieza de strings
      const methodData = {
        name: cleanStringField(formData.name) || 'Método sin nombre',
        type: formData.type,
        account_holder: cleanStringField(formData.account_holder),
        account_number: shouldShowField('account_number') ? cleanStringField(formData.account_number) : null,
        bank_name: shouldShowField('bank_name') ? cleanStringField(formData.bank_name) : null,
        phone: shouldShowField('phone') ? cleanStringField(formData.phone) : null,
        email: shouldShowField('email') ? cleanStringField(formData.email) : null,
        is_active: formData.is_active,
        // Guardar datos adicionales como JSON para campos especiales
        additional_data: formData.type === 'mobile_payment' && formData.cedula ? {
          cedula: cleanStringField(formData.cedula)
        } : null
      };

      console.log('Enviando datos del método de pago:', methodData);

      let error;

      if (paymentMethod) {
        // Actualizar método de pago existente
        const result = await supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', paymentMethod.id);
        error = result.error;
        console.log('Resultado actualización:', result);
      } else {
        // Crear nuevo método de pago
        const result = await supabase
          .from('payment_methods')
          .insert([methodData]);
        error = result.error;
        console.log('Resultado inserción:', result);
      }

      if (error) {
        console.error('Error en operación Supabase:', error);
        throw error;
      }

      toast.success(paymentMethod ? 'Método de pago actualizado exitosamente' : 'Método de pago creado exitosamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error completo:', error);
      toast.error('Error al guardar método de pago: ' + (error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Corregir accesibilidad: agregar aria-describedby */}
      <DialogContent className="max-w-2xl" aria-describedby="payment-method-form-description">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod ? 'Editar Método de Pago' : 'Agregar Método de Pago'}
          </DialogTitle>
          <p id="payment-method-form-description" className="text-sm text-gray-600">
            {paymentMethod ? 'Modifica los datos del método de pago seleccionado' : 'Completa la información para crear un nuevo método de pago'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: Nombre y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del Método *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Pago Móvil Banesco"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Pago *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Titular y Banco (si aplica) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_holder">Titular de la Cuenta</Label>
              <Input
                id="account_holder"
                value={formData.account_holder}
                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                placeholder="Nombre del titular"
              />
            </div>

            {shouldShowField('bank_name') && (
              <div>
                <Label htmlFor="bank_name">Banco</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Nombre del banco"
                />
              </div>
            )}
          </div>

          {/* Fila 3: Campos específicos según tipo de pago */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mostrar número de cuenta solo si NO es Pago Móvil */}
            {shouldShowField('account_number') && (
              <div>
                <Label htmlFor="account_number">Número de Cuenta</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="0000-0000-00-0000000000"
                />
              </div>
            )}

            {/* Mostrar cédula solo para Pago Móvil */}
            {shouldShowField('cedula') && (
              <div>
                <Label htmlFor="cedula">Cédula del Titular</Label>
                <Input
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  placeholder="V-12345678"
                />
              </div>
            )}

            {/* Mostrar teléfono si aplica */}
            {shouldShowField('phone') && (
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="04XX-XXXXXXX"
                />
              </div>
            )}

            {/* Mostrar email si aplica */}
            {shouldShowField('email') && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="pagos@ejemplo.com"
                />
              </div>
            )}
          </div>

          {/* Checkbox de método activo */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_active: checked as boolean })
              }
            />
            <Label htmlFor="is_active">Método activo</Label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (paymentMethod ? 'Actualizar' : 'Crear Método')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
