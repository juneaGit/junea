'use client';

import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Countdown } from '@/components/wedding/countdown';
import { useDashboard } from '@/hooks/use-dashboard';
import { useBudget } from '@/hooks/use-budget';
import { useAuth } from '@/hooks/use-auth';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { realtimeService } from '@/services/supabase';
import { cn } from '@/utils/cn';

// Types pour les skeletons
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton = ({ className, style }: SkeletonProps) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} style={style} />
);

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ height = "300px" }: { height?: string }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full" style={{ height }} />
    </CardContent>
  </Card>
);

export const DashboardInfoDynamic = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: weddingProfile } = useWeddingProfile();
  
  // Hooks Redux
  const {
    overview,
    summary,
    chartData,
    loading,
    error,
    healthStatus,
    formattedStats,
    loadAllData,
    refreshStats,
    clearDashboardError,
    isDataStale,
    getHealthColor,
    getHealthMessage
  } = useDashboard();

  const {
    budgets,
    expenses,
    expensesByCategory,
    chartData: budgetChartData,
    loadBudgets,
    loadExpenses
  } = useBudget();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Chargement initial des données
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      console.log('📊 Chargement initial dashboard pour utilisateur:', user.id);
      loadAllData(user.id);
      loadBudgets(user.id);
      loadExpenses(user.id);
      setLastRefreshTime(new Date());
    }
  }, [user?.id, isAuthenticated, loadAllData, loadBudgets, loadExpenses]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Configuration subscriptions temps réel');
    
    // Subscribe aux changements dashboard
    const dashboardChannel = realtimeService.subscribeToDashboardStats(
      user.id, 
      (payload) => {
        console.log('📊 Dashboard stats mis à jour:', payload);
        loadAllData(user.id);
      }
    );

    // Subscribe aux changements budget
    const budgetChannel = realtimeService.subscribeToBudgetChanges(
      user.id,
      (payload) => {
        console.log('💰 Budget mis à jour:', payload);
        loadBudgets(user.id);
        loadExpenses(user.id);
      }
    );

    // Cleanup
    return () => {
      console.log('🔄 Nettoyage subscriptions');
      realtimeService.unsubscribeAll(user.id);
    };
  }, [user?.id, loadAllData, loadBudgets, loadExpenses]);

  // Auto-refresh si données obsolètes
  useEffect(() => {
    if (!user?.id || !isDataStale(10)) return; // Refresh si > 10 minutes

    console.log('⏰ Données obsolètes, refresh automatique');
    handleRefresh();
  }, [user?.id, isDataStale]);

  // Gestion du refresh manuel
  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      await refreshStats(user.id);
      await loadBudgets(user.id);
      await loadExpenses(user.id);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Erreur refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, refreshStats, loadBudgets, loadExpenses]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      console.error('Dashboard error:', error);
    }
  }, [error]);

  const clearError = useCallback(() => {
    clearDashboardError();
  }, [clearDashboardError]);

  // Calculs locaux pour l'affichage
  const daysUntilWedding = weddingProfile?.wedding_date 
    ? Math.ceil((new Date(weddingProfile.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Redirection si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('auth.login')}</p>
          <Button onClick={() => router.push('/auth/login')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  // Loading initial
  if (loading.overview || loading.stats) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="rounded-lg border bg-gradient-to-r from-rose-50 to-pink-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              <Button onClick={clearError} variant="ghost">
                Ignorer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header avec score de santé */}
      <div className="rounded-lg border bg-gradient-to-r from-rose-50 to-pink-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {weddingProfile?.partner_name ? 
                `Mariage de ${weddingProfile.partner_name} 💕` : 
                'Dashboard Mariage 💕'
              }
            </h1>
            <p className="text-gray-600">
              {weddingProfile?.wedding_type && weddingProfile?.wedding_location ? 
                `${weddingProfile.wedding_type} • ${weddingProfile.wedding_location}` :
                'Organisez votre mariage de rêve'
              }
            </p>
            
            {/* Score de santé */}
            <div className="mt-3 flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: getHealthColor() }}
              />
              <span className="text-sm font-medium text-gray-700">
                {getHealthMessage()} ({healthStatus.score}/100)
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {lastRefreshTime && (
              <div className="text-xs text-gray-500">
                Mis à jour: {lastRefreshTime.toLocaleTimeString('fr-FR')}
              </div>
            )}
            <Button
              onClick={handleRefresh}
              className="bg-rose-500 hover:bg-rose-600"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Actualisation...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="mr-2 size-4" />
                  Actualiser
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Compte à rebours */}
        <Card className="bg-gradient-to-br from-rose-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-100">Jour J dans</p>
              </div>
              <CalendarDaysIcon className="size-8 text-rose-200" />
            </div>
            {weddingProfile?.wedding_date && daysUntilWedding !== null ? (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.max(0, daysUntilWedding)}</div>
                  <div className="text-sm text-rose-100">jours</div>
                </div>
                <p className="text-center text-sm text-rose-100">
                  {new Date(weddingProfile.wedding_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-rose-100">Date non définie</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                {formattedStats.budget ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {formattedStats.budget.spent}€ / {formattedStats.budget.total}€
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: formattedStats.budget.percentageColor }}
                    >
                      {formattedStats.budget.percentage}% • {formattedStats.budget.statusText}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-400">0€</div>
                    <p className="text-sm text-gray-400">Budget non configuré</p>
                  </div>
                )}
              </div>
              <CurrencyEuroIcon className="size-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Invités */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invités confirmés</p>
                {formattedStats.guests ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {formattedStats.guests.confirmed}/{formattedStats.guests.total}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: formattedStats.guests.confirmationColor }}
                    >
                      {formattedStats.guests.confirmationRate}% • {formattedStats.guests.statusText}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-400">0/0</div>
                    <p className="text-sm text-gray-400">Pas d'invités</p>
                  </div>
                )}
              </div>
              <UserGroupIcon className="size-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Tâches */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tâches terminées</p>
                {formattedStats.tasks ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {formattedStats.tasks.completed}/{formattedStats.tasks.total}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: formattedStats.tasks.progressColor }}
                    >
                      {formattedStats.tasks.completionPercentage}% • {formattedStats.tasks.statusText}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-400">0/0</div>
                    <p className="text-sm text-gray-400">Pas de tâches</p>
                  </div>
                )}
              </div>
              <CheckCircleIcon className="size-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques dynamiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Graphique budget barre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyEuroIcon className="size-5 text-blue-500" />
              Répartition du budget
            </CardTitle>
            <CardDescription>
              Budget par catégorie de dépenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}€`} />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Montant" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="text-center">
                  <CurrencyEuroIcon className="mx-auto mb-2 size-12 text-gray-300" />
                  <p>Aucune donnée de budget</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => router.push('/app/budget')}
                  >
                    <PlusIcon className="mr-2 size-4" />
                    Gérer le budget
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique dashboard circulaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-5 text-purple-500" />
              Vue d'ensemble
            </CardTitle>
            <CardDescription>
              Distribution par type de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.budgetByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.budgetByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.budgetByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}€`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="text-center">
                  <SparklesIcon className="mx-auto mb-2 size-12 text-gray-300" />
                  <p>Données en cours de chargement</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button 
          onClick={() => router.push('/app/budget')}
          className="h-16 flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600"
        >
          <CurrencyEuroIcon className="size-6" />
          <div>
            <div className="font-semibold">Gérer le budget</div>
            <div className="text-sm opacity-90">Ajouter des dépenses</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => router.push('/app/guests')}
          className="h-16 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600"
        >
          <UserGroupIcon className="size-6" />
          <div>
            <div className="font-semibold">Gérer les invités</div>
            <div className="text-sm opacity-90">RSVP et contacts</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => router.push('/app/planning')}
          className="h-16 flex items-center justify-center gap-3 bg-purple-500 hover:bg-purple-600"
        >
          <CheckCircleIcon className="size-6" />
          <div>
            <div className="font-semibold">Planning des tâches</div>
            <div className="text-sm opacity-90">Organiser les étapes</div>
          </div>
        </Button>
      </div>

      {/* Issues à résoudre */}
      {healthStatus.issues && healthStatus.issues.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Points d'attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {healthStatus.issues?.map((issue, index) => (
                <li key={index} className="text-orange-700 text-sm">
                  • {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 