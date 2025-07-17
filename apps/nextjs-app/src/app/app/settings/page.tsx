'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/auth';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { 
  UserIcon, 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  wedding_reminders: boolean;
  task_deadlines: boolean;
  budget_alerts: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  wedding_theme: string;
  compact_mode: boolean;
}

export default function SettingsPage() {
  const user = useUser();
  const { data: weddingProfile } = useWeddingProfile();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security' | 'danger'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    full_name: 'Marie & Pierre Dupont',
    email: 'marie.dupont@email.com',
    avatar_url: '',
    created_at: '2024-01-15T10:00:00Z'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    wedding_reminders: true,
    task_deadlines: true,
    budget_alerts: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    wedding_theme: weddingProfile?.wedding_type || 'romantique',
    compact_mode: false
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleProfileUpdate = () => {
    // Logique de mise à jour du profil
    console.log('Mise à jour du profil:', userProfile);
  };

  const handleNotificationUpdate = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleAppearanceUpdate = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = () => {
    // Logique de changement de mot de passe
    console.log('Changement de mot de passe');
  };

  const handleAccountDeletion = () => {
    // Logique de suppression de compte
    console.log('Suppression de compte');
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Apparence', icon: PaintBrushIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'danger', name: 'Zone dangereuse', icon: TrashIcon },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">
            Gérez votre compte et vos préférences
          </p>
        </div>
        <Cog6ToothIcon className="h-8 w-8 text-gray-400" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar des onglets */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-rose-100 text-rose-700 border-l-4 border-rose-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Modifiez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Changer la photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG ou GIF. Maximum 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={userProfile.full_name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de mariage
                  </label>
                  <input
                    type="date"
                    value={weddingProfile?.wedding_date || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} className="bg-rose-500 hover:bg-rose-600">
                    Sauvegarder les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Gérez vos préférences de notification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {key === 'email_notifications' ? 'Notifications par email' :
                         key === 'push_notifications' ? 'Notifications push' :
                         key === 'wedding_reminders' ? 'Rappels de mariage' :
                         key === 'task_deadlines' ? 'Échéances des tâches' :
                         'Alertes budget'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {key === 'email_notifications' ? 'Recevez des notifications par email' :
                         key === 'push_notifications' ? 'Notifications sur votre navigateur' :
                         key === 'wedding_reminders' ? 'Rappels importants pour votre mariage' :
                         key === 'task_deadlines' ? 'Notifications pour les tâches urgentes' :
                         'Alertes quand vous dépassez votre budget'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNotificationUpdate(key as keyof NotificationSettings, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de votre interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème de l'application
                  </label>
                  <select
                    value={appearance.theme}
                    onChange={(e) => handleAppearanceUpdate('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="system">Système</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème de mariage
                  </label>
                  <select
                    value={appearance.wedding_theme}
                    onChange={(e) => handleAppearanceUpdate('wedding_theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="romantique">Romantique</option>
                    <option value="bohemien">Bohémien</option>
                    <option value="oriental">Oriental</option>
                    <option value="bollywood">Bollywood</option>
                    <option value="bonne_franquette">À la bonne franquette</option>
                    <option value="moderne">Moderne</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Mode compact</h3>
                    <p className="text-sm text-gray-500">
                      Réduire l'espacement pour afficher plus de contenu
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearance.compact_mode}
                      onChange={(e) => handleAppearanceUpdate('compact_mode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Mot de passe</h3>
                      <p className="text-sm text-gray-500">
                        Dernière modification il y a 30 jours
                      </p>
                    </div>
                    <Button variant="outline" onClick={handlePasswordChange}>
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Changer
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
                      <p className="text-sm text-gray-500">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <Button variant="outline">
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Sessions actives</h3>
                      <p className="text-sm text-gray-500">
                        Gérez vos sessions de connexion
                      </p>
                    </div>
                    <Button variant="outline">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Voir les sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-red-900">Supprimer le compte</h3>
                      <p className="text-sm text-red-700">
                        Supprime définitivement votre compte et toutes vos données
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleAccountDeletion}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-orange-900">Réinitialiser les données</h3>
                      <p className="text-sm text-orange-700">
                        Supprime toutes les données de mariage mais garde le compte
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 