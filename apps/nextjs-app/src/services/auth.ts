import { supabase } from '@/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  // Inscription avec email/password
  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    }
  }

  // Connexion avec email/password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la connexion');
    }
  }

  // Connexion avec Google OAuth
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la connexion Google');
    }
  }

  // Déconnexion
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la déconnexion');
    }
  }

  // Récupérer l'utilisateur actuel
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Récupérer la session actuelle
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la réinitialisation');
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil');
    }
  }
}

export const authService = new AuthService(); 