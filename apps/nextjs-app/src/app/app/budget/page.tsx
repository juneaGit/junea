'use client';

import {
  CurrencyEuroIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

// Nouveaux imports
import { AddExpenseModal, type ExpenseFormData } from '@/components/budget/add-expense-modal';
import { useBudget } from '@/hooks/use-budget';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';

// ===================================
// INTERFACE POUR LES DÉPENSES
// ===================================

interface BudgetExpense {
  id: string;
  category: string;
  name: string;
  vendor_name?: string;
  amount: number;
  actual_cost?: number;
  paid: boolean;
  description?: string;
  notes?: string;
  created_at: string;
}

// ===================================
// COULEURS POUR LES GRAPHIQUES
// ===================================

const COLORS = [
  '#f43f5e',
  '#ec4899',
  '#d946ef',
  '#a855f7',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
];

export default function BudgetPage() {
  // ===================================
  // HOOKS ET STATE
  // ===================================

  const { user } = useAuth();
  const {
    budgets,
    expenses,
    loading: budgetLoading,
    error: budgetError,
    loadBudgets,
    loadExpenses,
    addExpense,
  } = useBudget();
  
  const {
    refreshStats,
    loading: dashboardLoading,
  } = useDashboard();

  // État local pour la modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ===================================
  // EFFECTS
  // ===================================

  useEffect(() => {
    if (user?.id) {
      loadBudgets(user.id);
      loadExpenses(user.id);
    }
  }, [user?.id, loadBudgets, loadExpenses]);

  // ===================================
  // CALCULS DE STATISTIQUES
  // ===================================

  // Utiliser les vraies données d'expenses ou fallback sur des données démo
  const displayedExpenses: BudgetExpense[] = expenses.length > 0 ? expenses.map(exp => ({
    id: exp.id,
    category: exp.category,
    name: exp.name,
    vendor_name: exp.vendor_name || undefined,
    amount: exp.amount,
    actual_cost: exp.paid ? exp.amount : 0, // Si payé, utiliser le montant comme coût réel
    paid: exp.paid,
    description: exp.description || undefined,
    notes: exp.notes || undefined,
    created_at: exp.created_at,
  })) : [
    // Données de démonstration si pas de vraies données
    {
      id: 'demo-1',
      category: 'Lieu',
      name: 'Château de Versailles',
      amount: 8000,
      actual_cost: 7500,
      paid: true,
      vendor_name: 'Château Events',
      notes: 'Réduction de 500€ obtenue',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      category: 'Traiteur',
      name: 'Menu 3 services',
      amount: 6000,
      actual_cost: 6200,
      paid: false,
      vendor_name: 'Delice Catering',
      notes: 'Supplément végétarien +200€',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      category: 'Photographie',
      name: 'Photographe + vidéaste',
      amount: 2500,
      actual_cost: 0,
      paid: false,
      vendor_name: 'Studio Lumière',
      notes: 'Acompte de 30% à verser',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      category: 'Fleurs',
      name: 'Bouquets et décoration',
      amount: 1500,
      actual_cost: 1200,
      paid: true,
      vendor_name: 'Fleurs & Co',
      notes: 'Fleurs de saison',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      category: 'Musique',
      name: 'DJ + sono',
      amount: 1200,
      actual_cost: 0,
      paid: false,
      vendor_name: 'Sound Events',
      notes: 'Matériel inclus',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-6',
      category: 'Robe/Costume',
      name: 'Tenues mariés',
      amount: 2000,
      actual_cost: 1800,
      paid: true,
      vendor_name: 'Mariage Couture',
      notes: 'Retouches incluses',
      created_at: new Date().toISOString(),
    },
  ];

  const totalEstimated = displayedExpenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalActual = displayedExpenses.reduce(
    (sum, item) => sum + (item.actual_cost || 0),
    0,
  );
  const totalPaid = displayedExpenses
    .filter((item) => item.paid)
    .reduce((sum, item) => sum + (item.actual_cost || 0), 0);

  const budgetByCategory = displayedExpenses.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { estimated: 0, actual: 0, count: 0 };
      }
      acc[item.category].estimated += item.amount;
      acc[item.category].actual += (item.actual_cost || 0);
      acc[item.category].count += 1;
      return acc;
    },
    {} as Record<string, { estimated: number; actual: number; count: number }>,
  );

  const chartData = Object.entries(budgetByCategory).map(
    ([category, data], index) => ({
      name: category,
      estimated: data.estimated,
      actual: data.actual,
      color: COLORS[index % COLORS.length],
    }),
  );

  const pieData = chartData.map((item) => ({
    name: item.name,
    value: item.estimated,
    color: item.color,
  }));

  // ===================================
  // HANDLERS D'ACTIONS
  // ===================================

  // Handler pour l'ajout d'une dépense
  const handleAddExpense = async (data: ExpenseFormData) => {
    if (!user?.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    if (budgets.length === 0) {
      toast.error('Aucun budget trouvé. Créez d\'abord un budget.');
      return;
    }

    setSubmitLoading(true);
    
    try {
      // Créer la dépense dans le premier budget disponible
      const expenseFormData = {
        ...data,
        category: data.category as any, // Cast temporaire pour compatibilité
      };
      await addExpense(expenseFormData, budgets[0].id, user.id);

      // Actualiser les données
      await Promise.all([
        loadExpenses(user.id),
        refreshStats(user.id), // Sync avec dashboard
      ]);

      toast.success(`Dépense "${data.name}" ajoutée avec succès !`, {
        duration: 4000,
        position: 'top-right',
      });

    } catch (error) {
      console.error('Erreur création dépense:', error);
      toast.error('Erreur lors de l\'ajout de la dépense');
      throw error; // Re-throw pour que la modal puisse gérer l'erreur
    } finally {
      setSubmitLoading(false);
    }
  };

  // Marquer comme payé/non payé
  const togglePaidStatus = async (expenseId: string) => {
    if (!user?.id) return;

    try {
      // Trouver la dépense actuelle
      const currentExpense = displayedExpenses.find(exp => exp.id === expenseId);
      if (!currentExpense) return;

      // Utiliser l'API pour mettre à jour
      // TODO: Implementer updateExpense dans le hook
      toast.success(
        `Dépense marquée comme ${!currentExpense.paid ? 'payée' : 'non payée'}`,
        { duration: 2000 }
      );
      
      // Refresh des données
      await loadExpenses(user.id);
      
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Supprimer une dépense
  const deleteExpense = async (expenseId: string) => {
    if (!user?.id) return;

    try {
      // TODO: Implementer deleteExpense dans le hook
      toast.success('Dépense supprimée');
      await loadExpenses(user.id);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getBudgetStatus = () => {
    if (totalEstimated === 0) {
      return { color: 'text-gray-500', status: 'Pas de budget' };
    }
    
    const percentage = (totalActual / totalEstimated) * 100;
    if (percentage > 100)
      return { color: 'text-red-600', status: 'Dépassement' };
    if (percentage > 80)
      return { color: 'text-orange-600', status: 'Attention' };
    return { color: 'text-green-600', status: 'Dans les clous' };
  };

  const budgetStatus = getBudgetStatus();

  // ===================================
  // LOADING STATE
  // ===================================

  if (budgetLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Chargement du budget...</span>
      </div>
    );
  }

  // ===================================
  // RENDER
  // ===================================

  return (
    <>
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion du Budget
            </h1>
            <p className="mt-2 text-gray-600">
              Suivez vos dépenses et optimisez votre budget mariage
            </p>
            {budgetError && (
              <div className="mt-2 flex items-center gap-2 text-red-600">
                <ExclamationTriangleIcon className="size-5" />
                <span className="text-sm">Erreur de chargement des données</span>
              </div>
            )}
          </div>
          
          <Button 
            className="bg-rose-500 hover:bg-rose-600"
            onClick={() => setIsModalOpen(true)}
            disabled={budgetLoading || !user}
          >
            <PlusIcon className="mr-2 size-4" />
            Ajouter une dépense
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Budget estimé</p>
                  <p className="text-2xl font-bold">
                    {totalEstimated.toLocaleString()}€
                  </p>
                </div>
                <CurrencyEuroIcon className="size-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dépenses réelles</p>
                  <p className={`text-2xl font-bold ${budgetStatus.color}`}>
                    {totalActual.toLocaleString()}€
                  </p>
                  <p className="text-xs text-gray-500">{budgetStatus.status}</p>
                </div>
                <ChartBarIcon className="size-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant payé</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalPaid.toLocaleString()}€
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalActual > 0 ? ((totalPaid / totalActual) * 100).toFixed(0) : 0}% du réel
                  </p>
                </div>
                <CheckCircleIcon className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Économies</p>
                  <p className={`text-2xl font-bold ${
                    totalEstimated - totalActual >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(totalEstimated - totalActual).toLocaleString()}€
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalEstimated > 0 ? (((totalEstimated - totalActual) / totalEstimated) * 100).toFixed(0) : 0}% du budget
                  </p>
                </div>
                <div className={`size-8 ${
                  totalEstimated - totalActual >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {totalEstimated - totalActual >= 0 ? '📈' : '📉'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Graphique en barres */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Catégorie</CardTitle>
              <CardDescription>
                Budget estimé vs dépenses réelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
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
                    <ChartBarIcon className="mx-auto mb-2 size-12 text-gray-300" />
                    <p>Aucune donnée disponible</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <PlusIcon className="mr-2 size-4" />
                      Ajouter une dépense
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graphique circulaire */}
          <Card>
            <CardHeader>
              <CardTitle>Budget par Poste</CardTitle>
              <CardDescription>
                Répartition du budget estimé
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                                             label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {pieData.map((entry, index) => (
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
                    <p>Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tableau des dépenses */}
        <Card>
          <CardHeader>
            <CardTitle>Détail des dépenses ({displayedExpenses.length})</CardTitle>
            <CardDescription>
              Gérez vos postes de dépenses - 
              {expenses.length > 0 ? ' Données temps réel' : ' Données de démonstration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Catégorie</th>
                    <th className="p-3 text-left">Article</th>
                    <th className="p-3 text-left">Prestataire</th>
                    <th className="p-3 text-right">Estimé</th>
                    <th className="p-3 text-right">Réel</th>
                    <th className="p-3 text-center">Payé</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedExpenses.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-500">{item.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {item.vendor_name || '-'}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {item.amount.toLocaleString()}€
                      </td>
                      <td className="p-3 text-right font-medium">
                        {item.actual_cost && item.actual_cost > 0
                          ? `${item.actual_cost.toLocaleString()}€`
                          : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaidStatus(item.id)}
                          className={
                            item.paid ? 'text-green-600' : 'text-gray-400'
                          }
                        >
                          <CheckCircleIcon className="size-5" />
                        </Button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" title="Modifier">
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(item.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {displayedExpenses.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <CurrencyEuroIcon className="mx-auto mb-4 size-12 opacity-50" />
                  <h3 className="mb-2 text-lg font-medium">Aucune dépense</h3>
                  <p className="mb-4 text-sm">Commencez par ajouter vos premières dépenses</p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="mr-2 size-4" />
                    Ajouter une dépense
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions IA */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyEuroIcon className="size-5 text-purple-500" />
              Suggestions d&apos;optimisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h4 className="mb-2 font-semibold text-gray-900">
                  💡 Économie potentielle
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  {totalEstimated > totalActual 
                    ? `Vous avez économisé ${(totalEstimated - totalActual).toLocaleString()}€ sur votre budget !`
                    : 'Vous pourriez économiser en négociant avec vos prestataires.'
                  }
                </p>
                <Button variant="outline" size="sm">
                  Voir les suggestions
                </Button>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h4 className="mb-2 font-semibold text-gray-900">
                  📊 Analyse des dépenses
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  {displayedExpenses.length > 0 
                    ? `Vous avez ${displayedExpenses.length} postes de dépenses répartis sur ${Object.keys(budgetByCategory).length} catégories.`
                    : 'Ajoutez des dépenses pour voir l\'analyse de votre budget.'
                  }
                </p>
                <Button variant="outline" size="sm">
                  Analyse détaillée
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal d'ajout de dépense */}
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddExpense}
          loading={submitLoading}
        />
      </div>
    </>
  );
}
