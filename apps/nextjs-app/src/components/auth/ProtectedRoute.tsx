'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useAuthStateChange } from '@/lib/auth';
import { paths } from '@/config/paths';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  
  // Écouter les changements d'état d'authentification
  useAuthStateChange();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(paths.auth.login.getHref());
    }
  }, [isAuthenticated, isLoading, router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, ne pas afficher le contenu (la redirection se fait dans useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 