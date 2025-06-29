
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    is_active: true
  });

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        name: paymentMethod.name,
        type: paymentMethod.type,
        account_holder: paymentMethod.account_holder || '',
        account_number: paymentMethod.account_number || '',
        bank_name: paymentMethod.bank_name || '',
        phone: paymentMethod.phone || '',
        email: paymentMethod.email || '',
        is_active: paymentMethod.is_active
      });
    } else {
      setFormData({
        name: '',
        type: '',
        account_holder: '',
        account_number: '',
        bank_name: '',
        phone: '',
        email: '',
        is_active: true
      });
    }
  }, [paymentMethod, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const methodData = {
        name: formData.name,
        type: formData.type,
        account_holder: formData.account_holder || null,
        account_number: formData.account_number || null,
        bank_name: formData.bank_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        is_active: formData.is_active
      };

      let error;

      if (paymentMethod) {
        const result = await supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', paymentMethod.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('payment_methods')
          .insert([methodData]);
        error = result.error;
      }

      if (error) throw error;

      toast.success(paymentMethod ? 'Método de pago actualizado' : 'Método de pago creado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error('Error al guardar método de pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod ? 'Editar Método de Pago' : 'Agregar Método de Pago'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <Label htmlFor="account_number">Número de Cuenta</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="0000-0000-00-0000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Banco</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Nombre del banco"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="04XX-XXXXXXX"
              />
            </div>
          </div>

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
