'use client';

import React from 'react';

import { Sidebar } from '@/components/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/utils/cn';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const { getMainContentMarginClasses } = useSidebar();

  // Afficher un spinner pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="size-12 animate-spin rounded-full border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Rediriger vers la page d'authentification si non connecté
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Accès non autorisé
          </h2>
          <p className="mb-6 text-gray-600">
            Veuillez vous connecter pour accéder à votre espace mariage.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center rounded-lg bg-pink-500 px-4 py-2 text-white transition-colors hover:bg-pink-600"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content avec adaptation dynamique */}
      <div className={`flex flex-1 flex-col transition-all duration-500 ease-in-out ${getMainContentMarginClasses()}`}>
        {/* Header mobile */}
        <div className="flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
          <h1 className="text-xl font-semibold text-gray-900">Mon Mariage</h1>
        </div>

        {/* Content Area */}
        <main
          className={cn('flex-1 overflow-y-auto focus:outline-none', className)}
        >
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
