'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/auth';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  days_before_wedding: number;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Réserver le lieu de réception',
    description: 'Choisir et réserver le lieu principal pour la cérémonie et la réception',
    due_date: '2024-12-15',
    days_before_wedding: 365,
    is_completed: false,
    priority: 'urgent',
    category: 'venue'
  },
  {
    id: '2',
    title: 'Choisir le traiteur',
    description: 'Sélectionner le service de restauration et finaliser le menu',
    due_date: '2024-12-20',
    days_before_wedding: 330,
    is_completed: true,
    priority: 'high',
    category: 'catering'
  },
  {
    id: '3',
    title: 'Réserver le photographe',
    description: 'Engager un photographe professionnel pour immortaliser le jour J',
    due_date: '2025-01-10',
    days_before_wedding: 300,
    is_completed: false,
    priority: 'high',
    category: 'photography'
  },
  {
    id: '4',
    title: 'Envoyer les invitations',
    description: 'Créer et envoyer les invitations à tous les invités',
    due_date: '2025-02-01',
    days_before_wedding: 180,
    is_completed: false,
    priority: 'medium',
    category: 'invitations'
  },
  {
    id: '5',
    title: 'Essayage robe/costume',
    description: 'Finaliser le choix et les retouches de la tenue',
    due_date: '2025-03-15',
    days_before_wedding: 90,
    is_completed: false,
    priority: 'medium',
    category: 'dress'
  }
];

export default function PlanningPage() {
  const user = useUser();
  const { data: weddingProfile } = useWeddingProfile();
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'high': return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'medium': return <CalendarDaysIcon className="h-5 w-5 text-yellow-500" />;
      default: return <CalendarDaysIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimelinePosition = (daysBeforeWedding: number) => {
    const maxDays = 365;
    return Math.max(0, Math.min(100, (daysBeforeWedding / maxDays) * 100));
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rétro-Planning</h1>
          <p className="text-gray-600 mt-2">
            Organisez vos tâches depuis le jour J vers l'arrière
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600">
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter une tâche
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des tâches</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.is_completed).length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(t => !t.is_completed).length}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.priority === 'urgent' && !t.is_completed).length}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline des tâches</CardTitle>
          <CardDescription>
            Visualisez vos tâches sur une ligne de temps inversée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Ligne de temps */}
            <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-300 rounded-full"></div>
            
            {/* Marqueurs temporels */}
            <div className="flex justify-between text-xs text-gray-500 mb-8 mt-4">
              <span>Jour J</span>
              <span>6 mois</span>
              <span>1 an</span>
            </div>

            {/* Tâches */}
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`relative p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)} ${
                    task.is_completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPriorityIcon(task.priority)}
                        <h3 className={`font-semibold ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.is_completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {formatDate(task.due_date)}</span>
                        <span>⏰ J-{task.days_before_wedding} jours</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={task.is_completed ? 'text-green-600' : 'text-gray-400'}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <PlusIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Ajouter une tâche</h3>
            <p className="text-sm text-gray-600">Créer une nouvelle tâche personnalisée</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <CalendarDaysIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Générer planning IA</h3>
            <p className="text-sm text-gray-600">Créer un planning personnalisé avec l'IA</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Tâches urgentes</h3>
            <p className="text-sm text-gray-600">Voir les tâches prioritaires</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 