import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { saveUserLanguage, changeLanguageDemo, loadUserLanguage } from '@/store/slices/language-slice';
import { useAuth } from './use-auth';
import type { SupportedLanguage } from '@/lib/i18n';
import { useEffect } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  
  const { currentLanguage, loading, error, isAutoDetected } = useAppSelector(
    (state) => state.language
  );

  // Charger la langue utilisateur au démarrage
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(loadUserLanguage(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      if (isAuthenticated && user?.id) {
        // Utilisateur connecté : sauvegarder en base
        await dispatch(saveUserLanguage({ 
          userId: user.id, 
          language 
        })).unwrap();
      } else {
        // Mode démo : sauvegarder seulement dans localStorage
        await dispatch(changeLanguageDemo(language)).unwrap();
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
      return false;
    }
  };

  return {
    // Traduction
    t,
    i18n,
    
    // État de la langue
    currentLanguage,
    loading,
    error,
    isAutoDetected,
    
    // Actions
    changeLanguage,
  };
}; 