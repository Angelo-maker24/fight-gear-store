
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const OrdersManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Pedidos</CardTitle>
        <CardDescription>
          Administra todos los pedidos y comprobantes de pago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
          <p className="text-gray-600">
            Gestión completa de pedidos, verificación de pagos y estado de órdenes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
