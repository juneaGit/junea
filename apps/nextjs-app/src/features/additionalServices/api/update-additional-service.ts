import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/config/supabase';
import type { UpdateAdditionalServiceData, AdditionalService } from '../types';
import { getAdditionalServicesQueryOptions } from './get-additional-services';

export const updateAdditionalService = async (
  data: UpdateAdditionalServiceData & { user_id: string }
): Promise<AdditionalService> => {
  const { id, user_id, ...updateData } = data;

  const { data: result, error } = await supabase
    .from('additional_services')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update additional service: ${error.message}`);
  }

  return result;
};

export const updateServicesOrder = async (
  services: { id: string; sort_order: number }[],
  user_id: string
): Promise<void> => {
  // Mise à jour en lot de l'ordre des services
  const updates = services.map(service =>
    supabase
      .from('additional_services')
      .update({ sort_order: service.sort_order })
      .eq('id', service.id)
      .eq('user_id', user_id)
  );

  const results = await Promise.all(updates);
  
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    throw new Error(`Failed to update services order: ${errors[0].error?.message}`);
  }
};

export const useUpdateAdditionalService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdditionalService,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getAdditionalServicesQueryOptions(variables.user_id).queryKey,
      });
      
      // Invalider les queries du budget global si le coût a été modifié
      if (variables.estimated_budget !== undefined || variables.actual_cost !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ['budget-summary', variables.user_id],
        });
      }
    },
  });
};

export const useUpdateServicesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ services, user_id }: { services: { id: string; sort_order: number }[]; user_id: string }) =>
      updateServicesOrder(services, user_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getAdditionalServicesQueryOptions(variables.user_id).queryKey,
      });
    },
  });
}; 