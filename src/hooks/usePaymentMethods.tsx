
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  account_holder?: string;
  account_number?: string;
  bank_name?: string;
  phone?: string;
  email?: string;
  additional_data?: any;
  is_active: boolean;
  created_at: string;
}

export const usePaymentMethods = (includeInactive = false) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      // Solo filtrar por activos si no se incluyen inactivos (para admin)
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      toast.error('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [includeInactive]);

  return {
    paymentMethods,
    loading,
    refetch: fetchPaymentMethods
  };
};
