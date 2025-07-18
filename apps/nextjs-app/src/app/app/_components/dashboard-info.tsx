'use client';

import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { supabase } from '@/config/supabase';
import {
  useHasCompletedOnboarding,
  useWeddingProfile,
} from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';

import { DashboardSeedData } from './dashboard-seed-data';

interface DashboardStats {
  totalBudget: number;
  spentBudget: number;
  totalGuests: number;
  confirmedGuests: number;
  totalTasks: number;
  completedTasks: number;
  daysUntilWedding: number;
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  priority: string;
  category: string;
}

const budgetCategories = [
  { name: 'Lieu', color: '#f43f5e' },
  { name: 'Traiteur', color: '#ec4899' },
  { name: 'Photographie', color: '#d946ef' },
  { name: 'Musique', color: '#a855f7' },
  { name: 'Fleurs', color: '#8b5cf6' },
  { name: 'Robe/Costume', color: '#6366f1' },
  { name: 'Autres', color: '#3b82f6' },
];

export const DashboardInfo = () => {
  const router = useRouter();
  const user = useUser();
  const { hasCompleted, isLoading } = useHasCompletedOnboarding();
  const { data: weddingProfile } = useWeddingProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    spentBudget: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    totalTasks: 0,
    completedTasks: 0,
    daysUntilWedding: 0,
  });
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !hasCompleted) {
      router.push('/onboarding');
    }
  }, [isLoading, hasCompleted, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('🔍 Fetching dashboard data...');
      console.log('User data:', user.data);
      console.log('Wedding profile:', weddingProfile);

      // Si pas d'utilisateur connecté, utiliser les données demo
      if (!user.data) {
        console.log('🎮 Mode demo - utilisation des données de démonstration');
        setLoading(false);
        return;
      }

      // Si pas de profil de mariage, utiliser les données demo
      if (!weddingProfile) {
        console.log(
          '🎮 Pas de profil de mariage - utilisation des données de démonstration',
        );
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Récupération des données Supabase...');
        // Récupérer les données du budget
        const { data: budgetItems } = await supabase
          .from('budget_items')
          .select('*')
          .eq('user_id', user.data.id);

        // Récupérer les tâches
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.data.id)
          .order('due_date', { ascending: true });

        // Récupérer les invités
        const { data: guests } = await supabase
          .from('guests')
          .select('*')
          .eq('user_id', user.data.id);

        // Calculer les statistiques
        const totalBudget =
          budgetItems?.reduce(
            (sum, item) => sum + (item.estimated_cost || 0),
            0,
          ) || weddingProfile.estimated_budget;
        const spentBudget =
          budgetItems?.reduce(
            (sum, item) => sum + (item.actual_cost || 0),
            0,
          ) || 0;
        const totalGuests = guests?.length || weddingProfile.estimated_guests;
        const confirmedGuests =
          guests?.filter((g) => g.rsvp_status === 'confirmed').length || 0;
        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter((t) => t.is_completed).length || 0;

        // Calculer les jours jusqu'au mariage
        const daysUntilWedding = weddingProfile.wedding_date
          ? Math.ceil(
              (new Date(weddingProfile.wedding_date).getTime() -
                new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        setStats({
          totalBudget,
          spentBudget,
          totalGuests,
          confirmedGuests,
          totalTasks,
          completedTasks,
          daysUntilWedding,
        });

        // Préparer les données pour le graphique budget
        const budgetByCategory = budgetCategories.map((category) => {
          const categoryItems =
            budgetItems?.filter((item) =>
              item.category.toLowerCase().includes(category.name.toLowerCase()),
            ) || [];
          const estimated = categoryItems.reduce(
            (sum, item) => sum + (item.estimated_cost || 0),
            0,
          );
          const actual = categoryItems.reduce(
            (sum, item) => sum + (item.actual_cost || 0),
            0,
          );

          return {
            name: category.name,
            estimated,
            actual,
            color: category.color,
          };
        });

        setBudgetData(budgetByCategory.filter((item) => item.estimated > 0));
        setRecentTasks(tasks?.slice(0, 5) || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.data, weddingProfile]);

  const recalculateAll = async () => {
    if (!user.data || !weddingProfile) return;

    setLoading(true);
    // Simuler un recalcul (ici on pourrait ajouter de la logique IA)
    setTimeout(() => {
      setLoading(false);
      // Rafraîchir les données
      window.location.reload();
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasCompleted) {
    return null; // Redirection en cours
  }

  // Mode demo - afficher des données de démonstration
  if (!user.data || !weddingProfile) {
    console.log('🎮 Affichage du dashboard en mode demo');
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Dashboard de Mariage - Mode Démo
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre tableau de bord de mariage !
            {!user.data &&
              ' (Mode démonstration - connectez-vous pour sauvegarder vos données)'}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Budget Total
              </CardTitle>
              <CurrencyEuroIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25 000€</div>
              <p className="text-xs text-muted-foreground">Dépensé: 15 000€</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invités</CardTitle>
              <UserGroupIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120</div>
              <p className="text-xs text-muted-foreground">Confirmés: 85</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches</CardTitle>
              <CheckCircleIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12/20</div>
              <p className="text-xs text-muted-foreground">Terminées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jours restants
              </CardTitle>
              <CalendarDaysIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145</div>
              <p className="text-xs text-muted-foreground">
                Jusqu'au grand jour
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Prochaines Tâches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="size-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="font-medium">Réserver le photographe</p>
                    <p className="text-sm text-gray-500">Dans 3 jours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="size-2 rounded-full bg-orange-500"></div>
                  <div className="flex-1">
                    <p className="font-medium">Envoyer les invitations</p>
                    <p className="text-sm text-gray-500">Dans 7 jours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="font-medium">Essayage robe</p>
                    <p className="text-sm text-gray-500">Dans 14 jours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lieu (40%)</span>
                  <span className="text-sm font-medium">10 000€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Traiteur (30%)</span>
                  <span className="text-sm font-medium">7 500€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Photographie (15%)</span>
                  <span className="text-sm font-medium">3 750€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Autres (15%)</span>
                  <span className="text-sm font-medium">3 750€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => router.push('/onboarding')} className="mr-4">
            Refaire l&apos;onboarding
          </Button>
          <Button variant="outline" onClick={() => router.push('/auth/login')}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Données de test (temporaire) */}
      {stats.totalTasks === 0 && <DashboardSeedData />}

      {/* Header avec informations principales */}
      <div className="rounded-lg border bg-gradient-to-r from-rose-50 to-pink-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Mariage de {weddingProfile?.partner_name} 💕
            </h1>
            <p className="text-gray-600">
              {weddingProfile?.wedding_type} •{' '}
              {weddingProfile?.wedding_location}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={recalculateAll}
              className="bg-rose-500 hover:bg-rose-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="mr-2 size-4" />
                  Mettre à jour
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
            {weddingProfile?.wedding_date ? (
              <div className="space-y-3">
                <Countdown
                  targetDate={weddingProfile.wedding_date}
                  className="text-white"
                />
                <p className="text-center text-sm text-rose-100">
                  {new Date(weddingProfile.wedding_date).toLocaleDateString(
                    'fr-FR',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
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
                <p className="text-sm font-medium text-gray-600">
                  Budget utilisé
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {((stats.spentBudget / stats.totalBudget) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500">
                  {stats.spentBudget.toLocaleString()}€ /{' '}
                  {stats.totalBudget.toLocaleString()}€
                </p>
              </div>
              <CurrencyEuroIcon className="size-8 text-blue-500" />
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min((stats.spentBudget / stats.totalBudget) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invités */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Invités confirmés
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.confirmedGuests}/{stats.totalGuests}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.totalGuests > 0
                    ? Math.round(
                        (stats.confirmedGuests / stats.totalGuests) * 100,
                      )
                    : 0}
                  % confirmés
                </p>
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
                <p className="text-sm font-medium text-gray-600">
                  Tâches terminées
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedTasks}/{stats.totalTasks}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.totalTasks > 0
                    ? Math.round(
                        (stats.completedTasks / stats.totalTasks) * 100,
                      )
                    : 0}
                  % complétées
                </p>
              </div>
              <CheckCircleIcon className="size-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Graphique budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyEuroIcon className="size-5 text-blue-500" />
              Répartition du budget
            </CardTitle>
            <CardDescription>
              Budget estimé vs dépenses réelles par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}€`} />
                  <Legend />
                  <Bar dataKey="estimated" fill="#e5e7eb" name="Estimé" />
                  <Bar dataKey="actual" fill="#3b82f6" name="Réel" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="text-center">
                  <CurrencyEuroIcon className="mx-auto mb-2 size-12 text-gray-300" />
                  <p>Aucune donnée de budget disponible</p>
                  <Button variant="outline" className="mt-2">
                    <PlusIcon className="mr-2 size-4" />
                    Ajouter un budget
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique circulaire budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyEuroIcon className="size-5 text-rose-500" />
              Vue d'ensemble budget
            </CardTitle>
            <CardDescription>
              Répartition des dépenses par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="estimated"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}€`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="text-center">
                  <CurrencyEuroIcon className="mx-auto mb-2 size-12 text-gray-300" />
                  <p>Aucune donnée de budget disponible</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions IA */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-purple-500" />
            Suggestions IA personnalisées
          </CardTitle>
          <CardDescription>
            Recommandations basées sur votre type de mariage et vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 font-semibold text-gray-900">
                💡 Optimisation Budget
              </h4>
              <p className="mb-3 text-sm text-gray-600">
                Pour un mariage {weddingProfile?.wedding_type}, vous pourriez
                économiser 10-15% en choisissant un photographe local plutôt
                qu'un studio renommé.
              </p>
              <Button variant="outline" size="sm">
                Voir les recommandations
              </Button>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 font-semibold text-gray-900">
                🎵 Playlist Suggérée
              </h4>
              <p className="mb-3 text-sm text-gray-600">
                Basé sur votre style {weddingProfile?.wedding_type}, voici une
                sélection de musiques qui créeront l&apos;ambiance parfaite.
              </p>
              <Button variant="outline" size="sm">
                Générer playlist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tâches urgentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="size-5 text-orange-500" />
            Tâches urgentes
          </CardTitle>
          <CardDescription>Les 5 prochaines tâches à accomplir</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-2 rounded-full ${task.is_completed ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <div>
                      <p
                        className={`font-medium ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {task.due_date
                          ? `Échéance: ${formatDate(task.due_date)}`
                          : "Pas d'échéance"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                    <Button variant="ghost" size="sm">
                      <PencilIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-500">
              <div className="text-center">
                <CheckCircleIcon className="mx-auto mb-2 size-12 text-gray-300" />
                <p>Aucune tâche en cours</p>
                <Button variant="outline" className="mt-2">
                  <PlusIcon className="mr-2 size-4" />
                  Ajouter une tâche
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:bg-rose-50 hover:shadow-md"
          onClick={() => router.push('/app/planning')}
        >
          <CardContent className="p-6 text-center">
            <CalendarDaysIcon className="mx-auto mb-2 size-8 text-rose-500" />
            <h3 className="font-semibold text-gray-900">Rétro-planning</h3>
            <p className="text-sm text-gray-600">
              Gérer les tâches et échéances
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:bg-green-50 hover:shadow-md"
          onClick={() => router.push('/app/guests')}
        >
          <CardContent className="p-6 text-center">
            <UserGroupIcon className="mx-auto mb-2 size-8 text-green-500" />
            <h3 className="font-semibold text-gray-900">Invités</h3>
            <p className="text-sm text-gray-600">Gérer la liste d'invités</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:bg-blue-50 hover:shadow-md"
          onClick={() => router.push('/app/budget')}
        >
          <CardContent className="p-6 text-center">
            <CurrencyEuroIcon className="mx-auto mb-2 size-8 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Budget</h3>
            <p className="text-sm text-gray-600">Suivre les dépenses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
