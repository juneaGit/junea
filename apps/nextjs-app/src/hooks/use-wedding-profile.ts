import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { useUser } from '@/lib/auth';

export interface WeddingProfile {
  id: string;
  user_id: string;
  wedding_date: string | null;
  wedding_type: string;
  venue_type: string;
  meal_format: string;
  dietary_restrictions: string[];
  estimated_guests: number;
  estimated_budget: number;
  partner_name: string;
  wedding_location: string;
  theme_colors: string[];
  created_at: string;
  updated_at: string;
}

export const useWeddingProfile = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['wedding-profile', user.data?.id || 'demo'],
    queryFn: async (): Promise<WeddingProfile | null> => {
      console.log('🔍 Récupération du profil de mariage...');
      
      // TEMPORAIRE : Toujours utiliser le mode demo pour éviter les problèmes RLS
      console.log('🎮 Mode demo - récupération depuis localStorage');
      
      const demoProfile = localStorage.getItem('wedding-profile-demo');
      if (demoProfile) {
        const parsed = JSON.parse(demoProfile);
        console.log('✅ Profil trouvé en mode demo:', parsed);
        return {
          id: 'demo-profile',
          ...parsed
        };
      }
      
      console.log('❌ Aucun profil trouvé en mode demo');
      return null;
    },
    enabled: true, // Toujours activé pour supporter le mode demo
  });
};

export const useHasCompletedOnboarding = () => {
  const weddingProfile = useWeddingProfile();
  const user = useUser();
  
  console.log('🔍 useHasCompletedOnboarding - Wedding profile:', weddingProfile.data);
  console.log('🔍 useHasCompletedOnboarding - User:', user.data);
  
  // En mode demo, toujours considérer l'onboarding comme terminé si on a un profil
  const hasCompleted = !!weddingProfile.data || 
                      (!user.data && !!localStorage.getItem('wedding-profile-demo'));
  
  console.log('🔍 useHasCompletedOnboarding - Has completed:', hasCompleted);
  
  return {
    hasCompleted,
    isLoading: weddingProfile.isLoading,
    profile: weddingProfile.data,
  };
}; 