'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Attendre l'initialisation complète d'i18next
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => {
        setIsInitialized(true);
      };

      i18n.on('initialized', handleInitialized);

      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, []);

  // Affichage loading jusqu'à initialisation
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 