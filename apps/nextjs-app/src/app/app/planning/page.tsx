'use client';

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  HeartIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'done';
  dueDate?: string;
  estimatedDuration?: string;
  tips?: string[];
  relatedBudget?: number;
}

interface TaskFilter {
  category: string;
  timeline: string;
  status: string;
  urgency: string;
}

// Données exhaustives des tâches de rétro-planning
const DEFAULT_TASKS: Task[] = [
  // 12 mois
  {
    id: '1',
    title: 'Choisir la date et le lieu de la cérémonie',
    description:
      'Définir la date exacte et réserver le lieu de cérémonie religieuse ou civile',
    category: 'Général',
    timeline: '12 mois',
    urgency: 'high',
    status: 'todo',
    estimatedDuration: '2-4 semaines',
    tips: [
      'Évitez les périodes de vacances',
      'Vérifiez la disponibilité des proches',
    ],
    relatedBudget: 2000,
  },
  {
    id: '2',
    title: 'Commencer la liste des invités',
    description: 'Établir une première liste des invités avec vos proches',
    category: 'Général',
    timeline: '12 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1 semaine',
    tips: [
      'Commencez par la famille proche',
      'Pensez aux contraintes budgétaires',
    ],
  },
  {
    id: '3',
    title: 'Définir le budget global',
    description:
      'Établir un budget détaillé pour toutes les dépenses du mariage',
    category: 'Budget',
    timeline: '12 mois',
    urgency: 'high',
    status: 'todo',
    estimatedDuration: '3-5 jours',
    tips: ['Prévoyez 10% de marge pour les imprévus'],
    relatedBudget: 0,
  },

  // 10-12 mois
  {
    id: '4',
    title: 'Réserver la salle de réception',
    description: 'Choisir et réserver le lieu de votre réception',
    category: 'Prestataires',
    timeline: '10-12 mois',
    urgency: 'high',
    status: 'todo',
    estimatedDuration: '2-3 semaines',
    tips: ['Visitez plusieurs lieux', 'Négociez les tarifs groupe'],
    relatedBudget: 8000,
  },
  {
    id: '5',
    title: 'Choisir et réserver le traiteur',
    description: 'Sélectionner le traiteur et définir le menu',
    category: 'Prestataires',
    timeline: '10-12 mois',
    urgency: 'high',
    status: 'todo',
    estimatedDuration: '2-3 semaines',
    tips: ['Demandez une dégustation', 'Vérifiez les allergies des invités'],
    relatedBudget: 6000,
  },
  {
    id: '6',
    title: 'Chercher un photographe/vidéaste',
    description: 'Rechercher et contacter les photographes pour votre mariage',
    category: 'Prestataires',
    timeline: '10-12 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1-2 semaines',
    tips: ['Regardez leurs portfolios', 'Vérifiez leur disponibilité'],
    relatedBudget: 2500,
  },

  // 8-10 mois
  {
    id: '7',
    title: 'Choisir et commander les alliances',
    description: 'Sélectionner le style et commander vos alliances',
    category: 'Mode & Beauté',
    timeline: '8-10 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1 semaine',
    tips: [
      'Prévoyez les gravures personnalisées',
      'Pensez à la taille des doigts',
    ],
    relatedBudget: 1500,
  },
  {
    id: '8',
    title: 'Chercher la robe de mariée et le costume',
    description: 'Commencer la recherche et les premiers essayages',
    category: 'Mode & Beauté',
    timeline: '8-10 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '3-4 semaines',
    tips: ['Prévoyez plusieurs retouches', 'Définissez votre style'],
    relatedBudget: 3000,
  },
  {
    id: '9',
    title: 'Réserver le DJ ou groupe musical',
    description: "Choisir et réserver l'animation musicale",
    category: 'Prestataires',
    timeline: '8-10 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1-2 semaines',
    tips: ['Écoutez leurs démos', 'Discutez de votre playlist'],
    relatedBudget: 1800,
  },

  // 6-8 mois
  {
    id: '10',
    title: 'Organiser les essayages robe et costume',
    description: "Planifier les rendez-vous d'essayage et retouches",
    category: 'Mode & Beauté',
    timeline: '6-8 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '2-3 semaines',
    tips: ['Amenez vos sous-vêtements', 'Prévoyez les chaussures'],
  },
  {
    id: '11',
    title: 'Choisir et commander les faire-part',
    description: 'Concevoir et commander vos invitations de mariage',
    category: 'Décoration',
    timeline: '6-8 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '2 semaines',
    tips: ['Gardez le style cohérent', 'Prévoyez 10% de marge'],
    relatedBudget: 800,
  },
  {
    id: '12',
    title: 'Réserver le fleuriste',
    description: 'Choisir et réserver votre fleuriste pour les décorations',
    category: 'Fleuriste',
    timeline: '6-8 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1-2 semaines',
    tips: ['Choisissez des fleurs de saison', 'Pensez aux allergies'],
    relatedBudget: 2200,
  },

  // 4-6 mois
  {
    id: '13',
    title: 'Essayages finaux robe et costume',
    description: 'Faire les derniers essayages et ajustements',
    category: 'Mode & Beauté',
    timeline: '4-6 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1 semaine',
    tips: ['Testez votre mobilité', 'Vérifiez tous les détails'],
  },
  {
    id: '14',
    title: 'Planifier le voyage de noces',
    description: 'Organiser et réserver votre voyage de noces',
    category: 'Voyage de noces',
    timeline: '4-6 mois',
    urgency: 'low',
    status: 'todo',
    estimatedDuration: '2-3 semaines',
    tips: [
      'Vérifiez les vaccins nécessaires',
      'Réservez tôt pour les meilleures offres',
    ],
    relatedBudget: 4000,
  },

  // 2-4 mois
  {
    id: '15',
    title: 'Finaliser et envoyer les invitations',
    description: 'Finaliser la liste des invités et envoyer les faire-part',
    category: 'Général',
    timeline: '2-4 mois',
    urgency: 'high',
    status: 'todo',
    estimatedDuration: '1 semaine',
    tips: [
      'Demandez une confirmation de réception',
      'Incluez toutes les infos pratiques',
    ],
  },
  {
    id: '16',
    title: 'Réserver coiffeur/maquilleur',
    description: 'Choisir et réserver vos prestations beauté',
    category: 'Mode & Beauté',
    timeline: '2-4 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1-2 semaines',
    tips: ['Faites un essai avant', 'Apportez des photos de référence'],
    relatedBudget: 600,
  },
  {
    id: '17',
    title: 'Dégustation avec le traiteur',
    description: 'Organiser une dégustation pour valider le menu',
    category: 'Prestataires',
    timeline: '2-4 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1 jour',
    tips: ['Testez plusieurs options', 'Pensez aux régimes spéciaux'],
  },

  // 1-2 mois
  {
    id: '18',
    title: 'Confirmer toutes les réservations',
    description: 'Vérifier et confirmer tous vos prestataires',
    category: 'Général',
    timeline: '1-2 mois',
    urgency: 'high',
    status: 'todo',
    estimatedDuration: '3-5 jours',
    tips: ['Créez un planning détaillé', 'Échangez les contacts'],
  },
  {
    id: '19',
    title: 'Acheter les accessoires',
    description: "Finaliser l'achat des chaussures, bijoux et accessoires",
    category: 'Mode & Beauté',
    timeline: '1-2 mois',
    urgency: 'medium',
    status: 'todo',
    estimatedDuration: '1 semaine',
    tips: ['Testez le confort', 'Assortissez avec votre tenue'],
    relatedBudget: 800,
  },
  {
    id: '20',
    title: 'Préparer vos vœux',
    description: 'Rédiger et répéter vos vœux de mariage',
    category: 'Général',
    timeline: '1-2 mois',
    urgency: 'low',
    status: 'todo',
    estimatedDuration: '1-2 semaines',
    tips: ['Restez authentiques', 'Préparez un plan B émotionnel'],
  },
];

const CATEGORIES = [
  'Tous',
  'Général',
  'Prestataires',
  'Mode & Beauté',
  'Fleuriste',
  'Décoration',
  'Budget',
  'Voyage de noces',
];
const TIMELINES = [
  'Tous',
  '12 mois',
  '10-12 mois',
  '8-10 mois',
  '6-8 mois',
  '4-6 mois',
  '2-4 mois',
  '1-2 mois',
  '1 mois',
  '2-3 semaines',
  '1 semaine',
  'Jour J',
];
const URGENCIES = ['Tous', 'low', 'medium', 'high'];
const STATUSES = ['Tous', 'todo', 'inprogress', 'done'];

export default function PlanningPage() {
  const user = useUser();
  const { data: weddingProfile } = useWeddingProfile();

  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TaskFilter>({
    category: 'Tous',
    timeline: 'Tous',
    status: 'Tous',
    urgency: 'Tous',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState<string | null>(null);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'inprogress').length;
    const urgent = tasks.filter(
      (t) => t.urgency === 'high' && t.status !== 'done',
    ).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, urgent, progress };
  }, [tasks]);

  // Tâches filtrées
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filters.category === 'Tous' || task.category === filters.category;
      const matchesTimeline =
        filters.timeline === 'Tous' || task.timeline === filters.timeline;
      const matchesStatus =
        filters.status === 'Tous' || task.status === filters.status;
      const matchesUrgency =
        filters.urgency === 'Tous' || task.urgency === filters.urgency;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTimeline &&
        matchesStatus &&
        matchesUrgency
      );
    });
  }, [tasks, searchTerm, filters]);

  // Grouper les tâches par timeline
  const tasksByTimeline = useMemo(() => {
    const grouped = filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.timeline]) {
          acc[task.timeline] = [];
        }
        acc[task.timeline].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );

    // Trier par ordre chronologique
    const timelineOrder = [
      '12 mois',
      '10-12 mois',
      '8-10 mois',
      '6-8 mois',
      '4-6 mois',
      '2-4 mois',
      '1-2 mois',
      '1 mois',
      '2-3 semaines',
      '1 semaine',
      'Jour J',
    ];
    return timelineOrder.reduce(
      (acc, timeline) => {
        if (grouped[timeline]) {
          acc[timeline] = grouped[timeline];
        }
        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }, [filteredTasks]);

  // Gérer le changement de statut d'une tâche
  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    // Animation de célébration
    if (newStatus === 'done') {
      setCelebrationTask(taskId);
      setTimeout(() => setCelebrationTask(null), 3000);
    }
  };

  // Gérer le drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceTimeline = result.source.droppableId;
    const destTimeline = result.destination.droppableId;

    if (sourceTimeline === destTimeline) {
      // Réorganiser dans la même timeline
      const timelineTasks = [...tasksByTimeline[sourceTimeline]];
      const [reorderedTask] = timelineTasks.splice(result.source.index, 1);
      timelineTasks.splice(result.destination.index, 0, reorderedTask);

      setTasks((prev) => {
        const newTasks = [...prev];
        const startIndex = newTasks.findIndex((t) => t.id === reorderedTask.id);
        newTasks.splice(startIndex, 1);

        const endIndex = newTasks.findIndex((t) => t.timeline === destTimeline);
        newTasks.splice(endIndex + result.destination.index, 0, reorderedTask);

        return newTasks;
      });
    } else {
      // Déplacer vers une autre timeline
      const sourceTask = tasksByTimeline[sourceTimeline][result.source.index];
      const updatedTask = { ...sourceTask, timeline: destTimeline };

      setTasks((prev) =>
        prev.map((task) => (task.id === sourceTask.id ? updatedTask : task)),
      );
    }
  };

  const getUrgencyColor = (urgency: Task['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircleIconSolid className="size-5 text-green-500" />;
      case 'inprogress':
        return <ClockIcon className="size-5 text-yellow-500" />;
      default:
        return <div className="size-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      {/* Header avec progression */}
      <div className="sticky top-0 z-10 border-b border-pink-200 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <HeartIcon className="size-8 text-pink-500" />
                <SparklesIcon className="absolute -right-1 -top-1 size-4 text-pink-400" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-3xl font-bold text-transparent">
                  Rétro-Planning
                </h1>
                <p className="mt-1 text-gray-600">
                  Votre feuille de route vers le mariage parfait ♥
                </p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {stats.progress}%
                </div>
                <div className="text-sm text-gray-500">Accompli</div>
              </div>
              <div className="h-3 w-48 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {stats.completed}/{stats.total}
                </div>
                <div className="text-sm text-gray-500">Tâches</div>
              </div>
            </div>
          </div>

          {/* Message d'encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 p-4"
          >
            <p className="text-center text-gray-700">
              {stats.progress < 25 &&
                '🌸 Chaque grand voyage commence par un premier pas ! Vous y arrivez !'}
              {stats.progress >= 25 &&
                stats.progress < 50 &&
                '💐 Bravo ! Vous êtes sur la bonne voie. Junea est fière de vous !'}
              {stats.progress >= 50 &&
                stats.progress < 75 &&
                '💕 Fantastique ! Plus que quelques étapes avant votre jour magique !'}
              {stats.progress >= 75 &&
                stats.progress < 100 &&
                '🎉 Presque au bout ! Votre mariage de rêve se concrétise !'}
              {stats.progress === 100 &&
                '👑 Félicitations ! Vous êtes prêt(e) pour votre mariage parfait !'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <CalendarDaysIcon className="size-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircleIcon className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.inProgress}
                  </p>
                </div>
                <ClockIcon className="size-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.urgent}
                  </p>
                </div>
                <ExclamationTriangleIcon className="size-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 rounded-lg border border-pink-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Recherche */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-pink-500 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Bouton filtres */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="size-4" />
              Filtres
              {showFilters ? (
                <ChevronUpIcon className="size-4" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
            </Button>
          </div>

          {/* Filtres dépliables */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Catégorie
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Timeline
                    </label>
                    <select
                      value={filters.timeline}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          timeline: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                    >
                      {TIMELINES.map((timeline) => (
                        <option key={timeline} value={timeline}>
                          {timeline}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status === 'Tous'
                            ? 'Tous'
                            : status === 'todo'
                              ? 'À faire'
                              : status === 'inprogress'
                                ? 'En cours'
                                : 'Terminé'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Urgence
                    </label>
                    <select
                      value={filters.urgency}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          urgency: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                    >
                      {URGENCIES.map((urgency) => (
                        <option key={urgency} value={urgency}>
                          {urgency === 'Tous'
                            ? 'Tous'
                            : urgency === 'low'
                              ? 'Faible'
                              : urgency === 'medium'
                                ? 'Moyenne'
                                : 'Élevée'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline des tâches avec drag and drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {Object.entries(tasksByTimeline).map(
              ([timeline, timelineTasks]) => (
                <div
                  key={timeline}
                  className="rounded-lg border border-pink-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="size-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {timeline}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>({timelineTasks.length} tâches)</span>
                      <span>•</span>
                      <span>
                        {
                          timelineTasks.filter((t) => t.status === 'done')
                            .length
                        }{' '}
                        terminées
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={timeline}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          'space-y-3 min-h-[100px] p-2 rounded-lg transition-colors',
                          snapshot.isDraggingOver && 'bg-pink-50',
                        )}
                      >
                        {timelineTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  'border-l-4 bg-white rounded-lg shadow-sm p-4 cursor-move transition-all duration-200',
                                  getUrgencyColor(task.urgency),
                                  snapshot.isDragging && 'shadow-lg rotate-2',
                                  celebrationTask === task.id &&
                                    'animate-pulse',
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => {
                                      const newStatus =
                                        task.status === 'done'
                                          ? 'todo'
                                          : task.status === 'todo'
                                            ? 'inprogress'
                                            : 'done';
                                      updateTaskStatus(task.id, newStatus);
                                    }}
                                    className="mt-1 transition-transform hover:scale-110"
                                  >
                                    {getStatusIcon(task.status)}
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h3
                                          className={cn(
                                            'font-medium text-gray-900 mb-1',
                                            task.status === 'done' &&
                                              'line-through text-gray-500',
                                          )}
                                        >
                                          {task.title}
                                        </h3>
                                        <p className="mb-2 text-sm text-gray-600">
                                          {task.description}
                                        </p>

                                        <div className="mb-2 flex flex-wrap gap-2">
                                          <span className="rounded-full bg-pink-100 px-2 py-1 text-xs text-pink-700">
                                            {task.category}
                                          </span>
                                          {task.estimatedDuration && (
                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                              ⏱️ {task.estimatedDuration}
                                            </span>
                                          )}
                                          {task.relatedBudget && (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                              💰 {task.relatedBudget}€
                                            </span>
                                          )}
                                        </div>

                                        {task.tips && task.tips.length > 0 && (
                                          <div className="text-xs text-gray-500">
                                            <strong>💡 Tips:</strong>{' '}
                                            {task.tips.join(' • ')}
                                          </div>
                                        )}
                                      </div>

                                      <div className="ml-4 flex items-center gap-2">
                                        {task.urgency === 'high' && (
                                          <ExclamationTriangleIcon className="size-4 text-red-500" />
                                        )}
                                        <select
                                          value={task.status}
                                          onChange={(e) =>
                                            updateTaskStatus(
                                              task.id,
                                              e.target.value as Task['status'],
                                            )
                                          }
                                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <option value="todo">À faire</option>
                                          <option value="inprogress">
                                            En cours
                                          </option>
                                          <option value="done">Terminé</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Animation de célébration */}
                                <AnimatePresence>
                                  {celebrationTask === task.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="absolute inset-0 flex items-center justify-center rounded-lg bg-pink-500/20"
                                    >
                                      <div className="text-4xl">🎉</div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ),
            )}
          </div>
        </DragDropContext>

        {/* Bouton d'aide */}
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:from-pink-600 hover:to-rose-600"
          >
            <HeartIcon className="mr-2 size-5" />
            Besoin d'aide ?
          </Button>
        </div>
      </div>
    </div>
  );
}
