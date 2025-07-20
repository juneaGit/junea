'use client';

import { useState } from 'react';
import {
  UserIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  TrashIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@/components/ui/spinner';
import { LanguageSettings } from './_components/language-settings';

type TabId = 'profile' | 'notifications' | 'appearance' | 'language' | 'security' | 'danger';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading] = useState(false);

  const tabs = [
    { id: 'profile' as const, name: t('settings.profile'), icon: UserIcon },
    { id: 'notifications' as const, name: t('navigation.notifications'), icon: BellIcon },
    { id: 'appearance' as const, name: t('settings.appearance'), icon: PaintBrushIcon },
    { id: 'language' as const, name: t('settings.language'), icon: GlobeAltIcon },
    { id: 'security' as const, name: t('settings.security'), icon: ShieldCheckIcon },
    { id: 'danger' as const, name: t('settings.dangerZone'), icon: TrashIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('settings.profile')}
            </h2>
            <p className="text-gray-600">
              Gérer vos informations personnelles (à implémenter)
            </p>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('navigation.notifications')}
            </h2>
            <p className="text-gray-600">
              Configurer vos préférences de notifications (à implémenter)
            </p>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('settings.appearance')}
            </h2>
            <p className="text-gray-600">
              Personnaliser l'apparence de l'application (à implémenter)
            </p>
          </div>
        );

      case 'language':
        return <LanguageSettings />;

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('settings.security')}
            </h2>
            <p className="text-gray-600">
              Gérer la sécurité de votre compte (à implémenter)
            </p>
          </div>
        );

      case 'danger':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('settings.dangerZone')}
            </h2>
            <p className="text-gray-600">
              Actions irréversibles sur votre compte (à implémenter)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('settings.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('settings.description')}
          </p>
        </div>
        <Cog6ToothIcon className="size-8 text-gray-400" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar des onglets */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'border-l-4 border-rose-500 bg-rose-100 text-rose-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="flex-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {renderTabContent()}
                </div>
        </div>
      </div>
    </div>
  );
}
