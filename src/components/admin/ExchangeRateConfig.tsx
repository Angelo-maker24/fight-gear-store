
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ExchangeRateConfig = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Tasa de Cambio</CardTitle>
        <CardDescription>
          Configura la tasa de cambio USD a Bs (BCV o manual)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💱</div>
          <h3 className="text-xl font-semibold mb-2">Próximamente</h3>
          <p className="text-gray-600">
            Configuración automática del BCV y tasa manual de respaldo
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
