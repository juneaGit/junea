import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/config/supabase';
import type { CreateAdditionalServiceData, AdditionalService } from '../types';
import { getAdditionalServicesQueryOptions } from './get-additional-services';

export const createAdditionalService = async (
  data: CreateAdditionalServiceData & { user_id: string; wedding_profile_id?: string }
): Promise<AdditionalService> => {
  // Obtenir le prochain sort_order
  const { data: maxOrderData } = await supabase
    .from('additional_services')
    .select('sort_order')
    .eq('user_id', data.user_id)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = maxOrderData?.[0]?.sort_order ? maxOrderData[0].sort_order + 1 : 0;

  const serviceData = {
    ...data,
    sort_order: nextSortOrder,
    priority: data.priority || 3, // Priorité normale par défaut
    status: data.status || 'recherche',
  };

  const { data: result, error } = await supabase
    .from('additional_services')
    .insert(serviceData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create additional service: ${error.message}`);
  }

  return result;
};

export const useCreateAdditionalService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdditionalService,
    onSuccess: (_, variables) => {
      // Invalider et refetch les services de l'utilisateur
      queryClient.invalidateQueries({
        queryKey: getAdditionalServicesQueryOptions(variables.user_id).queryKey,
      });
      
      // Optionnel : invalider les queries du budget global si elles existent
      queryClient.invalidateQueries({
        queryKey: ['budget-summary', variables.user_id],
      });
    },
  });
}; 