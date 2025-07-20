import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/config/supabase';
import type { AdditionalService } from '../types';

export const getAdditionalServices = async (userId: string): Promise<AdditionalService[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data, error } = await supabase
    .from('additional_services')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch additional services: ${error.message}`);
  }

  return data || [];
};

export const getAdditionalServicesQueryOptions = (userId: string) => ({
  queryKey: ['additional-services', userId],
  queryFn: () => getAdditionalServices(userId),
  enabled: !!userId,
});

export const useAdditionalServices = (userId: string) => {
  return useQuery(getAdditionalServicesQueryOptions(userId));
}; 