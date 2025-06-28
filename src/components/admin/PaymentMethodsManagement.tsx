
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentMethodsManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Métodos de Pago</CardTitle>
        <CardDescription>
          Administra los métodos de pago disponibles en la tienda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
          <p className="text-gray-600">
            Gestión completa de métodos de pago (Pago móvil, Zelle, Binance, etc.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
