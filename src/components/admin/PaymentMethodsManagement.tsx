
import { useState } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodForm } from './PaymentMethodForm';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/hooks/usePaymentMethods';

const getPaymentTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'bank_transfer': 'Transferencia Bancaria',
    'mobile_payment': 'Pago Móvil',
    'zelle': 'Zelle',
    'binance': 'Binance Pay',
    'paypal': 'PayPal',
    'crypto': 'Criptomonedas'
  };
  return types[type] || type;
};

export const PaymentMethodsManagement = () => {
  // Incluir métodos inactivos para el admin
  const { paymentMethods, loading, refetch } = usePaymentMethods(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este método de pago?')) return;

    setActionLoading(methodId);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      toast.success('Método de pago eliminado exitosamente');
      refetch();
    } catch (error: any) {
      toast.error('Error al eliminar método de pago: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (methodId: string, currentStatus: boolean) => {
    setActionLoading(methodId);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !currentStatus })
        .eq('id', methodId);

      if (error) throw error;

      toast.success(`Método de pago ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      refetch();
    } catch (error: any) {
      toast.error('Error al actualizar método de pago: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando métodos de pago...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestión de Métodos de Pago
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Método
            </Button>
          </CardTitle>
          <CardDescription>
            Administra los métodos de pago disponibles en la tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">No hay métodos de pago</h3>
              <p className="text-gray-600 mb-4">Comienza agregando tu primer método de pago</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Método
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Titular</TableHead>
                  <TableHead>Cuenta/Datos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentTypeLabel(method.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{method.account_holder || '-'}</TableCell>
                    <TableCell>
                      {method.account_number || method.phone || method.email || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={method.is_active ? 'default' : 'secondary'}>
                        {method.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(method)}
                          disabled={actionLoading === method.id}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(method.id, method.is_active)}
                          disabled={actionLoading === method.id}
                        >
                          {method.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(method.id)}
                          disabled={actionLoading === method.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentMethodForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMethod(null);
        }}
        paymentMethod={editingMethod}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
          setEditingMethod(null);
        }}
      />
    </div>
  );
};
