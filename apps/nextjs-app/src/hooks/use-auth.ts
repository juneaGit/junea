import { useEffect } from 'react';

import { authService } from '@/services/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUser, setUser, setSession } from '@/store/slices/auth-slice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, session, loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Récupérer l'utilisateur actuel au chargement
    dispatch(getCurrentUser());

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);

      dispatch(setSession(session));

      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          }),
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
  };
}
