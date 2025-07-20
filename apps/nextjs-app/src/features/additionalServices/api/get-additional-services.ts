import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/config/supabase';
import type { AdditionalService } from '../types';

export const getAdditionalServices = async (userId: string): Promise<AdditionalService[]> => {
  // Vérification des prérequis
  if (!userId) {
    console.warn('Additional Services: No user ID provided, returning empty array');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('additional_services')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // Gestion d'erreurs spécifiques
      if (error.code === 'PGRST116') {
        console.warn('Additional Services: Table not found, returning empty array');
        return [];
      }
      
      console.error('Additional Services API Error:', error);
      throw new Error(`Failed to fetch additional services: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Additional Services: Unexpected error', error);
    
    // Retour gracieux en cas d'erreur
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw error;
    }
    
    // Pour les autres erreurs, retourner un tableau vide
    return [];
  }
};

export const getAdditionalServicesQueryOptions = (userId: string) => ({
  queryKey: ['additional-services', userId],
  queryFn: () => getAdditionalServices(userId),
  enabled: !!userId,
});

export const useAdditionalServices = (userId: string) => {
  return useQuery(getAdditionalServicesQueryOptions(userId));
}; 