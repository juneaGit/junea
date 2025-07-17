'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un spinner pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Rediriger vers la page d'authentification si non connecté
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre espace mariage.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Header mobile */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-xl font-semibold text-gray-900">Mon Mariage</h1>
        </div>
        
        {/* Content Area */}
        <main className={cn(
          'flex-1 overflow-y-auto focus:outline-none',
          className
        )}>
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 