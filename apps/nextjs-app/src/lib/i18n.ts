'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import fr from '../locales/fr.json';
import en from '../locales/en.json'; 
import es from '../locales/es.json';

// Types pour TypeScript
export type SupportedLanguage = 'fr' | 'en' | 'es';

// Configuration des ressources
const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
} as const;

// Configuration i18next sans erreurs TypeScript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'wedding-app-language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    debug: process.env.NODE_ENV === 'development',
    react: {
      useSuspense: false,
    },
  } as any); // Contournement TypeScript pour éviter les conflits de versions

// Export de l'instance configurée
export default i18n;

// Helper pour changer de langue de manière programmatique
export const changeLanguage = async (language: SupportedLanguage): Promise<boolean> => {
  try {
    await i18n.changeLanguage(language);
    
    // Sauvegarde dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding-app-language', language);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du changement de langue:', error);
    return false;
  }
};

// Helper pour obtenir la langue actuelle
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language?.split('-')[0] as SupportedLanguage) || 'fr';
};

// Helper pour obtenir les langues disponibles
export const getAvailableLanguages = () => [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const; 