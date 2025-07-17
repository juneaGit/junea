'use client';

import { useEffect } from 'react';
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/auth';
import { UserProfile } from '@/config/supabase';
import { paths } from '@/config/paths';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Schémas de validation pour l'authentification
export const loginInputSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis (min 6 caractères)'),
});

export const registerInputSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis (min 6 caractères)'),
  fullName: z.string().min(1, 'Nom complet requis'),
  confirmPassword: z.string().min(6, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;

// Clé de cache pour les requêtes utilisateur
const userQueryKey = ['auth', 'user'];

// Fonction pour récupérer l'utilisateur actuel
export const getUser = async (): Promise<User | null> => {
  try {
    const user = await authService.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

// Options de requête pour l'utilisateur
export const getUserQueryOptions = () => {
  return queryOptions({
    queryKey: userQueryKey,
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Hook pour récupérer l'utilisateur actuel
export const useUser = () => {
  const query = useQuery(getUserQueryOptions());
  
  console.log('🔍 useUser - Loading:', query.isLoading);
  console.log('🔍 useUser - Data:', query.data);
  console.log('🔍 useUser - Error:', query.error);
  
  return query;
};

// Hook pour la connexion
export const useLogin = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await authService.signIn(data.email, data.password);
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userQueryKey, data.user);
      onSuccess?.();
      router.push(paths.app.dashboard.getHref());
    },
    onError: (error) => {
      console.error('Erreur de connexion:', error);
    },
  });
};

// Hook pour l'inscription
export const useRegister = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const result = await authService.signUp(data.email, data.password, data.fullName);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Inscription réussie - Utilisateur créé:', data.user);
      queryClient.setQueryData(userQueryKey, data.user);
      console.log('✅ Cache utilisateur mis à jour');
      onSuccess?.();
      // Rediriger vers l'onboarding pour les nouveaux utilisateurs
      console.log('🔄 Redirection vers /onboarding');
      router.push('/onboarding');
    },
    onError: (error) => {
      console.error('Erreur d\'inscription:', error);
    },
  });
};

// Hook pour la déconnexion
export const useLogout = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await authService.signOut();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: userQueryKey });
      queryClient.clear();
      onSuccess?.();
      router.push(paths.auth.login.getHref());
    },
    onError: (error) => {
      console.error('Erreur de déconnexion:', error);
    },
  });
};

// Hook pour surveiller les changements d'authentification
export const useAuthStateChange = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          const user = await authService.getCurrentUser();
          queryClient.setQueryData(userQueryKey, user);
        } else if (event === 'SIGNED_OUT') {
          queryClient.removeQueries({ queryKey: userQueryKey });
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);
};

// Hook pour vérifier si l'utilisateur est connecté
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
