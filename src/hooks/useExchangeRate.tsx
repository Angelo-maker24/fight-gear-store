
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(50); // Valor por defecto
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Función para obtener la tasa del BCV desde PyDolar
  const fetchBCVRate = async (): Promise<number | null> => {
    try {
      console.log('Fetching BCV rate from PyDolar...');
      
      try {
        const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.log(`PyDolar returned ${response.status}`);
          return null;
        }
        
        const data = await response.json();
        console.log('Response from PyDolar:', data);
        
        // Buscar la tasa del USD (dólar estadounidense)
        const usdRate = data?.monitors?.usd?.price;
        if (usdRate && usdRate > 10) { // Validación básica
          console.log(`Valid BCV rate found: ${usdRate} from PyDolar`);
          return usdRate;
        }
        
        // Si no encontramos USD, intentar con otras fuentes confiables
        const alternativeSources = ['banesco', 'mercantil_banco', 'provincial', 'bnc'];
        for (const source of alternativeSources) {
          const rate = data?.monitors?.[source]?.price;
          if (rate && rate > 10) {
            console.log(`Valid rate found from ${source}: ${rate}`);
            return rate;
          }
        }
        
      } catch (error) {
        console.error('Error fetching from PyDolar:', error);
      }
      
      console.log('No valid rate found from any source');
      return null;
    } catch (error) {
      console.error('Error in fetchBCVRate:', error);
      return null;
    }
  };

  // Función para actualizar la tasa de cambio
  const updateExchangeRate = async () => {
    try {
      console.log('Updating exchange rate...');
      const bcvRate = await fetchBCVRate();
      
      if (bcvRate && bcvRate > 10) { // Validación básica
        console.log('Valid BCV rate fetched:', bcvRate);
        
        try {
          // Verificar si ya existe una configuración
          const { data, error } = await supabase
            .from('exchange_rate_config')
            .select('*')
            .limit(1)
            .maybeSingle();

          if (data) {
            // Actualizar registro existente
            const { error: updateError } = await supabase
              .from('exchange_rate_config')
              .update({
                last_bcv_rate: bcvRate,
                last_updated: new Date().toISOString(),
                use_manual_rate: false
              })
              .eq('id', data.id);

            if (updateError) {
              console.error('Error updating exchange rate in DB:', updateError);
              // Actualizar localmente si hay error con la base de datos
              setExchangeRate(bcvRate);
              setLastUpdated(new Date());
              toast.success(`Tasa actualizada localmente: ${bcvRate.toFixed(2)} Bs/USD`);
            } else {
              setExchangeRate(bcvRate);
              setLastUpdated(new Date());
              console.log('Exchange rate updated successfully to:', bcvRate);
              toast.success(`Tasa actualizada: ${bcvRate.toFixed(2)} Bs/USD`);
            }
          } else {
            // Si no existe configuración, solo actualizar localmente
            console.log('No config found, updating locally only');
            setExchangeRate(bcvRate);
            setLastUpdated(new Date());
            toast.success(`Tasa actualizada localmente: ${bcvRate.toFixed(2)} Bs/USD`);
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Actualizar localmente si hay problema con la base de datos
          setExchangeRate(bcvRate);
          setLastUpdated(new Date());
          toast.success(`Tasa actualizada localmente: ${bcvRate.toFixed(2)} Bs/USD`);
        }
      } else {
        console.log('Could not fetch valid BCV rate, keeping stored rate');
        toast.warning('No se pudo obtener la tasa del BCV, usando tasa almacenada');
      }
    } catch (error) {
      console.error('Error in updateExchangeRate:', error);
      toast.error('Error al actualizar tasa de cambio');
    }
  };

  // Función para obtener la tasa almacenada
  const fetchStoredRate = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rate_config')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching stored rate:', error);
        // Si hay error, usar valores por defecto
        setExchangeRate(50);
        setLastUpdated(null);
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
        // Si no hay configuración, usar valores por defecto
        console.log('No exchange rate config found, using defaults');
        setExchangeRate(50);
        setLastUpdated(null);
        updateExchangeRate();
      }
    } catch (error) {
      console.error('Error in fetchStoredRate:', error);
      // En caso de error, usar valores por defecto
      setExchangeRate(50);
      setLastUpdated(null);
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

  // Función para obtener la tasa en bolívares (compatibilidad)
  const rateInBs = exchangeRate;

  return {
    exchangeRate,
    rateInBs, // Agregado para compatibilidad con Checkout
    loading,
    lastUpdated,
    updateExchangeRate,
    fetchStoredRate
  };
};
