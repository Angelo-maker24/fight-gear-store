
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, DollarSign, TrendingUp } from 'lucide-react';

export const ExchangeRateConfig = () => {
  // Hooks para obtener datos de tasa de cambio
  const { exchangeRate, loading, lastUpdated, updateExchangeRate } = useExchangeRate();
  const [useManualRate, setUseManualRate] = useState(false);
  const [manualRate, setManualRate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar configuración al montar el componente
  useEffect(() => {
    fetchConfig();
  }, []);

  // Función para obtener la configuración actual de la base de datos
  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rate_config')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setUseManualRate(data.use_manual_rate || false);
        setManualRate(data.manual_rate?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  // Función para actualizar manualmente la tasa del BCV
  const handleUpdateBCV = async () => {
    setUpdating(true);
    try {
      await updateExchangeRate();
      toast.success('Tasa del BCV actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar tasa del BCV');
    } finally {
      setUpdating(false);
    }
  };

  // Función para guardar la configuración de tasa de cambio
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // Validar tasa manual si está habilitada
      const manualRateValue = parseFloat(manualRate);
      if (useManualRate && (isNaN(manualRateValue) || manualRateValue <= 0)) {
        toast.error('La tasa manual debe ser un número válido mayor que 0');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('exchange_rate_config')
        .upsert({
          use_manual_rate: useManualRate,
          manual_rate: useManualRate ? manualRateValue : null,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Configuración guardada exitosamente');
      
      // Recargar configuración después de guardar
      fetchConfig();
      
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando configuración...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Configuración de Tasa de Cambio
          </CardTitle>
          <CardDescription>
            Configura la tasa de cambio USD a Bs (BCV automático o manual)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tasa actual */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Tasa Actual
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {exchangeRate.toFixed(2)} Bs / USD
                </p>
                {lastUpdated && (
                  <p className="text-sm text-gray-600">
                    Actualizado: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
              <Badge variant={useManualRate ? 'secondary' : 'default'}>
                {useManualRate ? 'Manual' : 'BCV Automático'}
              </Badge>
            </div>
          </div>

          {/* Configuración automática del BCV */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Actualización Automática del BCV</h4>
                <p className="text-sm text-gray-600">
                  Se actualiza automáticamente cada 6 horas desde la fuente oficial
                </p>
              </div>
              <Button
                onClick={handleUpdateBCV}
                disabled={updating}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
                {updating ? 'Actualizando...' : 'Actualizar Ahora'}
              </Button>
            </div>
          </div>

          {/* Configuración manual */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Usar Tasa Manual</h4>
                <p className="text-sm text-gray-600">
                  Desactiva la actualización automática y usa una tasa fija
                </p>
              </div>
              <Switch
                checked={useManualRate}
                onCheckedChange={setUseManualRate}
              />
            </div>

            {/* Campo de tasa manual (solo visible si está habilitado) */}
            {useManualRate && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manualRate">Tasa Manual (Bs por USD)</Label>
                  <Input
                    id="manualRate"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={manualRate}
                    onChange={(e) => setManualRate(e.target.value)}
                    placeholder="Ejemplo: 36.50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botón para guardar configuración */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional para el administrador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>La tasa se obtiene automáticamente del Banco Central de Venezuela (BCV)</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>La actualización automática ocurre cada 6 horas</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Puedes usar una tasa manual si necesitas un valor específico</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Los precios en la tienda se calculan automáticamente usando esta tasa</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
