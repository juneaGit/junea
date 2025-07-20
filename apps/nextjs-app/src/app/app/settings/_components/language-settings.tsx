'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { saveUserLanguage, changeLanguageDemo, loadUserLanguage } from '@/store/slices/language-slice';
import { getAvailableLanguages, getCurrentLanguage, changeLanguage, type SupportedLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/utils/cn';

export const LanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  
  const { currentLanguage, loading, error, isAutoDetected } = useAppSelector(
    (state) => state.language
  );
  
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Charger la langue utilisateur au montage du composant
    if (isAuthenticated && user?.id) {
      dispatch(loadUserLanguage(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    setSelectedLanguage(language);
    setSaveSuccess(false);
    
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
      
      // Afficher le message de succès
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  const getCurrentLanguageName = () => {
    const availableLanguages = getAvailableLanguages();
    const lang = availableLanguages.find((l) => l.code === selectedLanguage);
    return lang ? lang.name : 'Français';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('settings.languageSettings.title')}
        </h2>
        <p className="mt-1 text-gray-600">
          {t('settings.languageSettings.description')}
        </p>
      </div>

      {/* Current Language Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GlobeAltIcon className="size-5 text-blue-600" />
            {t('settings.languageSettings.currentLanguage')}
          </CardTitle>
          <CardDescription>
            {getCurrentLanguageName()}
            {isAutoDetected && (
              <span className="ml-2 text-blue-600 text-sm">
                ({t('settings.languageSettings.autoDetect')})
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.languageSettings.selectLanguage')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {getAvailableLanguages().map((language) => (
            <div
              key={language.code}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                selectedLanguage === language.code
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
              onClick={() => handleLanguageChange(language.code)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {language.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language.code.toUpperCase()}
                  </div>
                </div>
              </div>
              
              {selectedLanguage === language.code && (
                <CheckIcon className="size-5 text-blue-600" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Messages d'état */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="size-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span>{t('common.loading')}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckIcon className="size-5" />
          <span>{t('settings.languageSettings.changesSaved')}</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}; 