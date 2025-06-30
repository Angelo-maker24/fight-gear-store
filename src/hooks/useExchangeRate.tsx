
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(50); // Valor por defecto
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBCVRate = async (): Promise<number | null> => {
    try {
      console.log('Fetching BCV rate from official sources...');
      
      // Intentar múltiples fuentes para obtener la tasa del BCV
      const sources = [
        'https://pydolarve.org/api/v1/dollar?page=bcv',
        'https://api.exchangerate-api.com/v4/latest/USD',
        'https://ve.dolarapi.com/v1/dolares/oficial'
      ];

      for (const source of sources) {
        try {
          const response = await fetch(source);
          const data = await response.json();
          
          console.log(`Response from ${source}:`, data);
          
          // Procesar respuesta según la fuente
          if (source.includes('pydolarve')) {
            if (data?.monitors?.bcv?.price) {
              const rate = parseFloat(data.monitors.bcv.price);
              console.log('BCV rate from pydolarve:', rate);
              return rate;
            }
          } else if (source.includes('exchangerate-api')) {
            if (data?.rates?.VES) {
              const rate = parseFloat(data.rates.VES);
              console.log('BCV rate from exchangerate-api:', rate);
              return rate;
            }
          } else if (source.includes('dolarapi')) {
            if (data?.promedio) {
              const rate = parseFloat(data.promedio);
              console.log('BCV rate from dolarapi:', rate);
              return rate;
            }
          }
        } catch (error) {
          console.error(`Error fetching from ${source}:`, error);
          continue;
        }
      }
      
      console.log('No valid rate found from any source');
      return null;
    } catch (error) {
      console.error('Error in fetchBCVRate:', error);
      return null;
    }
  };

  const updateExchangeRate = async () => {
    try {
      console.log('Updating exchange rate...');
      const bcvRate = await fetchBCVRate();
      
      if (bcvRate && bcvRate > 10) { // Validación básica
        console.log('Valid BCV rate fetched:', bcvRate);
        
        // Actualizar en la base de datos
        const { error } = await supabase
          .from('exchange_rate_config')
          .upsert({
            last_bcv_rate: bcvRate,
            last_updated: new Date().toISOString(),
            use_manual_rate: false
          });

        if (error) {
          console.error('Error updating exchange rate:', error);
          toast.error('Error al actualizar tasa de cambio');
        } else {
          setExchangeRate(bcvRate);
          setLastUpdated(new Date());
          console.log('Exchange rate updated successfully to:', bcvRate);
          toast.success(`Tasa actualizada: ${bcvRate.toFixed(2)} Bs/USD`);
        }
      } else {
        console.log('Could not fetch valid BCV rate');
        toast.warning('No se pudo obtener la tasa del BCV, usando tasa almacenada');
      }
    } catch (error) {
      console.error('Error in updateExchangeRate:', error);
      toast.error('Error al actualizar tasa de cambio');
    }
  };

  const fetchStoredRate = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rate_config')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching stored rate:', error);
        return;
      }

      if (data) {
        const rate = data.use_manual_rate ? data.manual_rate : data.last_bcv_rate;
        setExchangeRate(rate || 50);
        setLastUpdated(data.last_updated ? new Date(data.last_updated) : null);
        
        console.log('Stored rate loaded:', rate);
        
        // Si no es manual y ha pasado más de 6 horas, actualizar
        if (!data.use_manual_rate) {
          const lastUpdate = new Date(data.last_updated || 0);
          const now = new Date();
          const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate > 6) {
            console.log('Rate is outdated, updating...');
            updateExchangeRate();
          }
        }
      } else {
        // Si no hay configuración, crear una y obtener la tasa del BCV
        console.log('No exchange rate config found, creating initial setup...');
        updateExchangeRate();
      }
    } catch (error) {
      console.error('Error in fetchStoredRate:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoredRate();
    
    // Actualizar cada 6 horas
    const interval = setInterval(() => {
      updateExchangeRate();
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    exchangeRate,
    loading,
    lastUpdated,
    updateExchangeRate,
    fetchStoredRate
  };
};
