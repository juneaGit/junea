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

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  is_paid: boolean;
  vendor_name?: string;
  notes?: string;
}

const defaultBudgetItems: BudgetItem[] = [
  {
    id: '1',
    category: 'Lieu',
    item_name: 'Château de Versailles',
    estimated_cost: 8000,
    actual_cost: 7500,
    is_paid: true,
    vendor_name: 'Château Events',
    notes: 'Réduction de 500€ obtenue',
  },
  {
    id: '2',
    category: 'Traiteur',
    item_name: 'Menu 3 services',
    estimated_cost: 6000,
    actual_cost: 6200,
    is_paid: false,
    vendor_name: 'Delice Catering',
    notes: 'Supplément végétarien +200€',
  },
  {
    id: '3',
    category: 'Photographie',
    item_name: 'Photographe + vidéaste',
    estimated_cost: 2500,
    actual_cost: 0,
    is_paid: false,
    vendor_name: 'Studio Lumière',
    notes: 'Acompte de 30% à verser',
  },
  {
    id: '4',
    category: 'Fleurs',
    item_name: 'Bouquets et décoration',
    estimated_cost: 1500,
    actual_cost: 1200,
    is_paid: true,
    vendor_name: 'Fleurs & Co',
    notes: 'Fleurs de saison',
  },
  {
    id: '5',
    category: 'Musique',
    item_name: 'DJ + sono',
    estimated_cost: 1200,
    actual_cost: 0,
    is_paid: false,
    vendor_name: 'Sound Events',
    notes: 'Matériel inclus',
  },
  {
    id: '6',
    category: 'Robe/Costume',
    item_name: 'Tenues mariés',
    estimated_cost: 2000,
    actual_cost: 1800,
    is_paid: true,
    vendor_name: 'Mariage Couture',
    notes: 'Retouches incluses',
  },
];

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
  const [budgetItems, setBudgetItems] =
    useState<BudgetItem[]>(defaultBudgetItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const totalEstimated = budgetItems.reduce(
    (sum, item) => sum + item.estimated_cost,
    0,
  );
  const totalActual = budgetItems.reduce(
    (sum, item) => sum + item.actual_cost,
    0,
  );
  const totalPaid = budgetItems
    .filter((item) => item.is_paid)
    .reduce((sum, item) => sum + item.actual_cost, 0);

  const budgetByCategory = budgetItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { estimated: 0, actual: 0, count: 0 };
      }
      acc[item.category].estimated += item.estimated_cost;
      acc[item.category].actual += item.actual_cost;
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

  const togglePaidStatus = (itemId: string) => {
    setBudgetItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, is_paid: !item.is_paid } : item,
      ),
    );
  };

  const deleteItem = (itemId: string) => {
    setBudgetItems((items) => items.filter((item) => item.id !== itemId));
  };

  const getBudgetStatus = () => {
    const percentage = (totalActual / totalEstimated) * 100;
    if (percentage > 100)
      return { color: 'text-red-600', status: 'Dépassement' };
    if (percentage > 80)
      return { color: 'text-orange-600', status: 'Attention' };
    return { color: 'text-green-600', status: 'Dans les clous' };
  };

  const budgetStatus = getBudgetStatus();

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
            Gestion du Budget
          </h1>
          <p className="mt-2 text-gray-600">
            Suivez vos dépenses et optimisez votre budget mariage
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600">
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
                  {((totalPaid / totalActual) * 100).toFixed(0)}% du réel
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
                <p className="text-sm text-gray-600">Reste à payer</p>
                <p className="text-2xl font-bold text-red-600">
                  {(totalActual - totalPaid).toLocaleString()}€
                </p>
                <p className="text-xs text-gray-500">
                  {budgetItems.filter((item) => !item.is_paid).length} factures
                </p>
              </div>
              <ExclamationTriangleIcon className="size-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
            <CardDescription>Budget estimé vs dépenses réelles</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition du budget</CardTitle>
            <CardDescription>Pourcentage par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}€`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des dépenses</CardTitle>
          <CardDescription>Gérez vos postes de dépenses</CardDescription>
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
                {budgetItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-500">{item.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {item.vendor_name || '-'}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {item.estimated_cost.toLocaleString()}€
                    </td>
                    <td className="p-3 text-right font-medium">
                      {item.actual_cost > 0
                        ? `${item.actual_cost.toLocaleString()}€`
                        : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePaidStatus(item.id)}
                        className={
                          item.is_paid ? 'text-green-600' : 'text-gray-400'
                        }
                      >
                        <CheckCircleIcon className="size-5" />
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions IA */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrencyEuroIcon className="size-5 text-purple-500" />
            Suggestions d'optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 font-semibold text-gray-900">
                💡 Économie potentielle
              </h4>
              <p className="mb-3 text-sm text-gray-600">
                Vous pourriez économiser jusqu'à 800€ en négociant avec vos
                prestataires ou en choisissant des alternatives locales.
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
                Votre budget lieu représente 40% du total, ce qui est dans la
                moyenne pour un mariage de votre type.
              </p>
              <Button variant="outline" size="sm">
                Analyse détaillée
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
