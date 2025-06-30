
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(50); // Valor por defecto
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBCVRate = async (): Promise<number | null> => {
    try {
      // Scraping del BCV usando una API externa que parsea la página
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      // Si no hay datos del BCV, usar una API alternativa
      if (!data.rates?.VES) {
        // Intentar con otra fuente
        const bcvResponse = await fetch('https://pydolarve.org/api/v1/dollar');
        const bcvData = await bcvResponse.json();
        
        if (bcvData?.monitors?.bcv?.price) {
          return parseFloat(bcvData.monitors.bcv.price);
        }
      }
      
      return data.rates?.VES || null;
    } catch (error) {
      console.error('Error fetching BCV rate:', error);
      return null;
    }
  };

  const updateExchangeRate = async () => {
    try {
      console.log('Fetching BCV rate...');
      const bcvRate = await fetchBCVRate();
      
      if (bcvRate) {
        console.log('BCV rate fetched:', bcvRate);
        
        // Actualizar en la base de datos
        const { error } = await supabase
          .from('exchange_rate_config')
          .upsert({
            last_bcv_rate: bcvRate,
            last_updated: new Date().toISOString()
          });

        if (error) {
          console.error('Error updating exchange rate:', error);
        } else {
          setExchangeRate(bcvRate);
          setLastUpdated(new Date());
          console.log('Exchange rate updated successfully');
        }
      } else {
        console.log('Could not fetch BCV rate, using stored rate');
      }
    } catch (error) {
      console.error('Error in updateExchangeRate:', error);
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
        
        // Si la tasa no es manual y ha pasado más de 1 día, actualizar
        if (!data.use_manual_rate) {
          const lastUpdate = new Date(data.last_updated || 0);
          const now = new Date();
          const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate > 24) {
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
    
    // Actualizar cada 24 horas
    const interval = setInterval(() => {
      updateExchangeRate();
    }, 24 * 60 * 60 * 1000);

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
