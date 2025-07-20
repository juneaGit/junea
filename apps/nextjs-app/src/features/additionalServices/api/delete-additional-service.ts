import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/config/supabase';
import { getAdditionalServicesQueryOptions } from './get-additional-services';

export const deleteAdditionalService = async (
  id: string,
  user_id: string
): Promise<void> => {
  const { error } = await supabase
    .from('additional_services')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);

  if (error) {
    throw new Error(`Failed to delete additional service: ${error.message}`);
  }
};

export const useDeleteAdditionalService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user_id }: { id: string; user_id: string }) =>
      deleteAdditionalService(id, user_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getAdditionalServicesQueryOptions(variables.user_id).queryKey,
      });
      
      // Invalider les queries du budget global
      queryClient.invalidateQueries({
        queryKey: ['budget-summary', variables.user_id],
      });
    },
  });
}; 