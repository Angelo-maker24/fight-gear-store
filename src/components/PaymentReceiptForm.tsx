
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, FileImage, X } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PaymentReceiptData {
  holderName: string;
  holderPhone: string;
  holderCedula: string;
  bankUsed: string;
  amountPaid: string;
  referenceNumber: string;
  paymentMethodId: string;
  receiptImage: File | null;
}

interface PaymentReceiptFormProps {
  orderId: string;
  totalAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentReceiptForm = ({ orderId, totalAmount, onSuccess, onCancel }: PaymentReceiptFormProps) => {
  const { user } = useAuth();
  const { uploadFile, uploading } = useFileUpload({ bucket: 'receipts', folder: 'payment-receipts' });
  const [submitting, setSubmitting] = useState(false);
  const { paymentMethods } = usePaymentMethods();

  const [formData, setFormData] = useState<PaymentReceiptData>({
    holderName: '',
    holderPhone: '',
    holderCedula: '',
    bankUsed: '',
    amountPaid: totalAmount.toString(),
    referenceNumber: '',
    paymentMethodId: '',
    receiptImage: null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof PaymentReceiptData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar selección de imagen
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receiptImage: file
      }));

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover imagen seleccionada
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      receiptImage: null
    }));
    setImagePreview(null);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!formData.holderName.trim()) {
      toast.error('El nombre del titular es obligatorio');
      return false;
    }
    if (!formData.holderPhone.trim()) {
      toast.error('El teléfono es obligatorio');
      return false;
    }
    if (!formData.holderCedula.trim()) {
      toast.error('La cédula es obligatoria');
      return false;
    }
    if (!formData.bankUsed.trim()) {
      toast.error('El banco utilizado es obligatorio');
      return false;
    }
    if (!formData.amountPaid.trim() || isNaN(Number(formData.amountPaid))) {
      toast.error('El monto pagado debe ser un número válido');
      return false;
    }
    if (!formData.referenceNumber.trim()) {
      toast.error('El número de referencia es obligatorio');
      return false;
    }
    if (!formData.receiptImage) {
      toast.error('Debe subir una imagen del comprobante de pago');
      return false;
    }
    if (!formData.paymentMethodId) {
      toast.error('Debe seleccionar un método de pago');
      return false;
}
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Subiendo comprobante de pago para orden:', orderId);
      
      // Subir imagen del comprobante
      let receiptImageUrl: string | null = null;
      if (formData.receiptImage) {
        receiptImageUrl = await uploadFile(formData.receiptImage);
        if (!receiptImageUrl) {
          toast.error('Error al subir la imagen del comprobante');
          return;
        }
      }

      // Preparar datos del comprobante
      const receiptData = {
        order_id: orderId,
        user_id: user.id,
        holder_name: formData.holderName.trim(),
        holder_phone: formData.holderPhone.trim(),
        holder_cedula: formData.holderCedula.trim(),
        bank_used: formData.bankUsed.trim(),
        amount_paid: Number(formData.amountPaid),
        reference_number: formData.referenceNumber.trim(),
        payment_method_id: formData.paymentMethodId || null,
        receipt_image_url: receiptImageUrl,
        status: 'pending'
      };

      console.log('Insertando comprobante de pago:', receiptData);

      // Insertar comprobante en la base de datos
      const { error } = await supabase
        .from('payment_receipts')
        .insert([receiptData]);

      if (error) {
        console.error('Error al insertar comprobante:', error);
        throw error;
      }

      console.log('Comprobante insertado exitosamente');
      toast.success('Comprobante de pago enviado exitosamente');
      onSuccess();

    } catch (error: any) {
      console.error('Error completo al enviar comprobante:', error);
      toast.error('Error al enviar el comprobante: ' + (error?.message || 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comprobante de Pago</CardTitle>
        <CardDescription>
          Por favor, sube tu comprobante de pago y completa los datos requeridos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subida de imagen del comprobante */}
          <div className="space-y-2">
            <Label htmlFor="receipt-image">Imagen del Comprobante *</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="receipt-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label htmlFor="receipt-image" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para subir tu comprobante de pago
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG hasta 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview del comprobante"
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del titular */}
            <div>
              <Label htmlFor="holder-name">Nombre del Titular *</Label>
              <Input
                id="holder-name"
                value={formData.holderName}
                onChange={(e) => handleInputChange('holderName', e.target.value)}
                placeholder="Nombre completo del titular"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor="holder-phone">Teléfono *</Label>
              <Input
                id="holder-phone"
                value={formData.holderPhone}
                onChange={(e) => handleInputChange('holderPhone', e.target.value)}
                placeholder="04XX-XXXXXXX"
                required
              />
            </div>

            {/* Cédula */}
            <div>
              <Label htmlFor="holder-cedula">Cédula *</Label>
              <Input
                id="holder-cedula"
                value={formData.holderCedula}
                onChange={(e) => handleInputChange('holderCedula', e.target.value)}
                placeholder="V-12345678 o E-12345678"
                required
              />
            </div>

            {/* Banco utilizado */}
            <div>
              <Label htmlFor="bank-used">Banco Utilizado *</Label>
              <Input
                id="bank-used"
                value={formData.bankUsed}
                onChange={(e) => handleInputChange('bankUsed', e.target.value)}
                placeholder="Ej: Banco de Venezuela"
                required
              />
            </div>

            {/* Monto pagado */}
            <div>
              <Label htmlFor="amount-paid">Monto Pagado *</Label>
              <Input
                id="amount-paid"
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Número de referencia */}
            <div>
              <Label htmlFor="reference-number">Número de Referencia *</Label>
              <Input
                id="reference-number"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                placeholder="Número de referencia del pago"
                required
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <Label htmlFor="payment-method">Método de Pago Utilizado</Label>
              <select
                id="payment-method"
                value={formData.paymentMethodId}
                onChange={(e) => handleInputChange('paymentMethodId', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                required
              >
                <option value="">Seleccione un método de pago</option>
                {paymentMethods?.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              </div>

          {/* Botones de acción */}
          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting || uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || uploading} className="flex-1">
              {submitting || uploading ? 'Enviando...' : 'Enviar Comprobante'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
